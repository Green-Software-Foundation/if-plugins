import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';
import {KeyValuePair, ModelParams} from '../../types/common';
import {ModelPluginInterface} from '../../interfaces';
import * as dayjs from 'dayjs';
import CommonGenerator from './helpers/CommonGenerator';
import RandIntGenerator from './helpers/RandIntGenerator';
import {Generator} from './interfaces/index';
const {InputValidationError} = ERRORS;

export class MockObservations implements ModelPluginInterface {
  private errorBuilder = buildErrorMessage('MockObservations');
  private duration = 0;
  private timeBuckets: dayjs.Dayjs[] = [];
  private components: KeyValuePair = {};
  private generators: Generator[] = [];

  /**
   * Generate sets of mocked observations based on config
   * @param {Object[]} _inputs required per convention, ignored (does not effect the generated mocked observations)
   */
  async execute(_inputs: ModelParams[]): Promise<any[]> {
    const observations: ModelParams[] = [];
    const generatorToHistory = new Map<Generator, number[]>();
    this.generators.forEach(generator => {
      generatorToHistory.set(generator, []);
    });
    for (const componentKey in this.components) {
      if (Object.prototype.hasOwnProperty.call(this.components, componentKey)) {
        const component = this.components[componentKey];
        for (const timeBucket of this.timeBuckets) {
          const observation = this.createObservation(
            component,
            timeBucket,
            generatorToHistory
          );
          observations.push(observation);
        }
      }
    }
    return observations;
  }

  /**
   * Configures the MockObservations Plugin for IF
   * @param {Object} staticParams static parameters
   * @param {string} staticParams.timestamp-from ISO 8601 timestamp string
   * @param {string} staticParams.timestamp-to ISO 8601 timestamp string
   * @param {number} staticParams.duration duration in sec of a single mocked observation
   * @param {KeyValuePair} staticParams.components components for which the generate sets of mocked observations
   * @param {Generator[]} staticParams.genreators list of generator configs by which to generate sets of mocked observations
   */
  async configure(
    staticParams: object | undefined
  ): Promise<ModelPluginInterface> {
    if (staticParams === undefined) {
      throw new InputValidationError(
        this.errorBuilder({message: 'Input data is missing'})
      );
    }
    const timestampFrom: dayjs.Dayjs = dayjs(
      this.getValidatedParam(
        'timestamp-from',
        staticParams
      ) as unknown as string
    );
    const timestampTo: dayjs.Dayjs = dayjs(
      this.getValidatedParam('timestamp-to', staticParams) as unknown as string
    );
    this.duration = this.getValidatedParam(
      'duration',
      staticParams
    ) as unknown as number;
    this.timeBuckets = this.createTimeBuckets(
      timestampFrom,
      timestampTo,
      this.duration
    );
    this.components = this.getValidatedParam(
      'components',
      staticParams
    ) as KeyValuePair;
    this.generators = this.createGenerators(
      this.getValidatedParam('generators', staticParams)
    );
    return this;
  }

  /*
   * validate a parameter is included in a given parameters map.
   * return the validated param value, otherwise throw an InputValidationError.
   */
  private getValidatedParam(
    paramName: string,
    params: {[key: string]: any}
  ): object {
    if (paramName in params) {
      return params[paramName];
    } else {
      throw new InputValidationError(
        this.errorBuilder({message: paramName + ' missing from params'})
      );
    }
  }

  /*
   * create time buckets based on start time, end time and duration of each bucket.
   */
  private createTimeBuckets(
    timestampFrom: dayjs.Dayjs,
    timestampTo: dayjs.Dayjs,
    duration: number
  ): dayjs.Dayjs[] {
    const timeBuckets: dayjs.Dayjs[] = [];
    let currTimestamp: dayjs.Dayjs = timestampFrom;
    while (
      currTimestamp.isBefore(timestampTo) ||
      currTimestamp.isSame(timestampTo, 'second')
    ) {
      timeBuckets.push(currTimestamp);
      currTimestamp = currTimestamp.add(duration, 'second');
    }
    return timeBuckets;
  }

  /*
   * create generators based on a given config
   */
  private createGenerators(generatorsConfig: object): Generator[] {
    const generators: Generator[] = [];
    Object.entries(generatorsConfig).forEach(([key, value]) => {
      if ('common' === key) {
        const commonGenerator = new CommonGenerator();
        commonGenerator.initialise(value);
        generators.push(commonGenerator);
      }
      if ('randint' === key) {
        for (const fieldToPopulate in value) {
          const randIntGenerator = new RandIntGenerator();
          randIntGenerator.initialise(fieldToPopulate, value[fieldToPopulate]);
          generators.push(randIntGenerator);
        }
      }
    });
    return generators;
  }

  /*
   * create time buckets based on start time, end time and duration of each bucket.
   */
  private createObservation(
    component: Record<string, string>,
    timeBucket: dayjs.Dayjs,
    generatorToHistory: Map<Generator, number[]>
  ): ModelParams {
    const observation: ModelParams = {
      timestamp: timeBucket.format('YYYY-MM-DD HH:mm:ss'),
      duration: this.duration,
    };
    Object.assign(observation, component);
    for (const generator of this.generators) {
      const generated: Record<string, any> = generator.next(
        generatorToHistory.get(generator)
      );
      generatorToHistory.get(generator)?.push(generated.value);
      Object.assign(observation, generated);
    }
    return observation;
  }
}

export default MockObservations;
