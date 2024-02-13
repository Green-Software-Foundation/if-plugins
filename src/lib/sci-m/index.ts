import {z} from 'zod';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';
import {buildErrorMessage, mapPluginName} from '../../util/helpers';
import {ERRORS} from '../../util/errors';

const {InputValidationError} = ERRORS;

export const SciM = (): PluginInterface => {
  const MAPPED_NAME = mapPluginName(SciM.name);
  const errorBuilder = buildErrorMessage(SciM.name);
  const metadata = {
    kind: 'execute',
  };
  const METRICS = [
    'total-embodied-emissions',
    'expected-lifespan',
    'resources-reserved',
    'vcpus-allocated',
    'total-resources',
    'vcpus-total',
  ];

  /**
   * Calculate the Embodied carbon for a list of inputs.
   */
  const execute = async (
    inputs: PluginParams[],
    config?: Record<string, any>
  ): Promise<PluginParams[]> => {
    const mappedConfig = config && config[MAPPED_NAME];

    return inputs.map(input => {
      const inputWithConfig: PluginParams = Object.assign(
        {},
        input,
        mappedConfig
      );

      validateInput(inputWithConfig);

      return {
        ...input,
        'embodied-carbon': calculateEmbodiedCarbon(inputWithConfig),
      };
    });
  };

  /**
   * Calculate the Embodied carbon for the input.
   * M = totalEmissions * (duration/ExpectedLifespan) * (resourcesReserved/totalResources)
   */
  const calculateEmbodiedCarbon = (input: PluginParams) => {
    const safeInput = Object.assign(input, validateInput(input));
    const totalEmissions = parseNumberInput(
      safeInput['total-embodied-emissions'],
      'gCO2e'
    );
    const duration = parseNumberInput(safeInput['duration'], 'seconds');
    const expectedLifespan = parseNumberInput(
      safeInput['expected-lifespan'],
      'seconds'
    );
    const resourcesReserved = parseNumberInput(
      safeInput['vcpus-allocated'] || safeInput['resources-reserved'],
      'count'
    );
    const totalResources = parseNumberInput(
      safeInput['vcpus-total'] || safeInput['total-resources'],
      'count'
    );

    return (
      totalEmissions *
      (duration / expectedLifespan) *
      (resourcesReserved / totalResources)
    );
  };

  /**
   * Parses the input value, ensuring it is a valid number, and returns the parsed number.
   * Throws an InputValidationError if the value is not a valid number.
   */
  const parseNumberInput = (value: any, unit: string): number => {
    const parsedValue = typeof value === 'string' ? parseFloat(value) : value;

    if (typeof parsedValue !== 'number' || isNaN(parsedValue)) {
      throw new InputValidationError(
        errorBuilder({
          message: `'${value}' is not a valid number in input. Please provide it as ${unit}.`,
        })
      );
    }

    return parsedValue;
  };

  /**
   * Checks for required fields in input.
   */
  const validateInput = (input: PluginParams) => {
    const schemaWithVcpus = z.object({
      'total-embodied-emissions': z.number().gte(0).min(0),
      'expected-lifespan': z.number().gte(0).min(0),
      'vcpus-allocated': z.number().gte(0).min(0),
      'vcpus-total': z.number().gte(0).min(0),
    });

    const schemaWithResources = z.object({
      'total-embodied-emissions': z.number().gte(0).min(0),
      'expected-lifespan': z.number().gte(0).min(0),
      'resources-reserved': z.number().gte(0).min(0),
      'total-resources': z.number().gte(0).min(0),
    });

    const schema = schemaWithVcpus.or(schemaWithResources).refine(allDefined, {
      message: `All ${METRICS} should be present.`,
    });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  return {
    metadata,
    execute,
  };
};
