import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';

import {PluginInterface} from '../../interfaces';
import {ConfigParams, KeyValuePair, PluginParams} from '../../types/common';

import {CommonGenerator} from './helpers/common-generator';
import {RandIntGenerator} from './helpers/rand-int-generator';
import {Generator} from './interfaces/index';
import {ObservationParams} from './types';

dayjs.extend(utc);
dayjs.extend(timezone);

const {InputValidationError} = ERRORS;

export const MockObservations = (
  globalConfig: ConfigParams
): PluginInterface => {
  const errorBuilder = buildErrorMessage('MockObservations');
  const metadata = {
    kind: 'execute',
  };

  /**
   * Generate sets of mocked observations based on config.
   */
  const execute = async (inputs: PluginParams[]) => {
    const {duration, timeBuckets, components, generators} =
      await generateParamsFromConfig();
    const generatorToHistory = new Map<Generator, number[]>();

    generators.forEach(generator => {
      generatorToHistory.set(generator, []);
    });

    const defaults = inputs && inputs[0];

    return Object.entries(components).reduce(
      (acc: PluginParams[], [_key, component]) => {
        timeBuckets.forEach(timeBucket => {
          const observation = createObservation(
            {duration, component, timeBucket, generators},
            generatorToHistory
          );

          acc.push(Object.assign(observation, defaults));
        });

        return acc;
      },
      []
    );
  };

  /**
   * Configures the MockObservations Plugin for IF
   */
  const generateParamsFromConfig = async () => {
    const timestampFrom = dayjs.tz(
      <string>getValidatedParam('timestamp-from', globalConfig),
      'UTC'
    );
    const timestampTo = dayjs.tz(
      <string>getValidatedParam('timestamp-to', globalConfig),
      'UTC'
    );
    const duration = <number>getValidatedParam('duration', globalConfig);

    return {
      duration,
      timeBuckets: createTimeBuckets(timestampFrom, timestampTo, duration),
      components: getValidatedParam('components', globalConfig) as KeyValuePair,
      generators: createGenerators(
        getValidatedParam('generators', globalConfig)
      ),
    };
  };

  /*
   * validate a parameter is included in a given parameters map.
   * return the validated param value, otherwise throw an InputValidationError.
   */
  const getValidatedParam = <T>(
    paramName: string,
    params: {[key: string]: any}
  ): T => {
    if (!(paramName in params)) {
      throw new InputValidationError(
        errorBuilder({message: `${paramName} missing from global config`})
      );
    }

    return params[paramName];
  };

  /*
   * create time buckets based on start time, end time and duration of each bucket.
   */
  const createTimeBuckets = (
    timestampFrom: dayjs.Dayjs,
    timestampTo: dayjs.Dayjs,
    duration: number,
    timeBuckets: dayjs.Dayjs[] = []
  ): dayjs.Dayjs[] => {
    if (
      timestampFrom.isBefore(timestampTo) ||
      timestampFrom.isSame(timestampTo, 'second')
    ) {
      return createTimeBuckets(
        timestampFrom.add(duration, 'second'),
        timestampTo,
        duration,
        [...timeBuckets, timestampFrom]
      );
    }
    return timeBuckets;
  };

  /*
   * create generators based on a given config
   */
  const createGenerators = (generatorsConfig: object): Generator[] => {
    const createCommonGenerator = (config: any): Generator[] => [
      CommonGenerator(config),
    ];

    const createRandIntGenerators = (config: any): Generator[] => {
      return Object.entries(config).map(([fieldToPopulate, value]) =>
        RandIntGenerator(fieldToPopulate, value as KeyValuePair)
      );
    };

    return Object.entries(generatorsConfig).flatMap(([key, value]) => {
      if (key === 'common') {
        return createCommonGenerator(value);
      } else if (key === 'randint') {
        return createRandIntGenerators(value).flat();
      }
      return [];
    });
  };

  /*
   * Creates time buckets based on start time, end time and duration of each bucket.
   */
  const createObservation = (
    observationParams: ObservationParams,
    generatorToHistory: Map<Generator, number[]>
  ): PluginParams => {
    const {duration, component, timeBucket, generators} = observationParams;
    const timestamp = timeBucket.toISOString();

    const generateObservation = (generator: Generator) => {
      const history = generatorToHistory.get(generator) || [];
      const generated: Record<string, any> = generator.next(history);

      generatorToHistory.set(generator, [...history, generated.value]);

      return generated;
    };

    const generateObservations = (gen: Generator) => generateObservation(gen);
    const generatedValues = generators.map(generateObservations);
    const initialObservation: PluginParams = {
      timestamp,
      duration,
      ...component,
    };
    const generatedObservation = generatedValues.reduce(
      (observation, generated) => Object.assign(observation, generated),
      initialObservation
    );

    return generatedObservation as PluginParams;
  };

  return {
    metadata,
    execute,
  };
};
