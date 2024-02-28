import {z} from 'zod';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';

const {InputValidationError} = ERRORS;

export const SciM = (): PluginInterface => {
  const errorBuilder = buildErrorMessage(SciM.name);
  const metadata = {
    kind: 'execute',
  };
  const METRICS = [
    'device/emissions-embodied',
    'device/expected-lifespan',
    'resources-reserved',
    'vcpus-allocated',
    'resources-total',
    'vcpus-total',
  ];

  /**
   * Calculate the Embodied carbon for a list of inputs.
   */
  const execute = async (inputs: PluginParams[]) => {
    return inputs.map(input => {
      const safeInput = validateInput(input);

      return {
        ...input,
        'carbon-embodied': calculateEmbodiedCarbon(safeInput),
      };
    });
  };

  /**
   * Calculate the Embodied carbon for the input.
   * M = totalEmissions * (duration/ExpectedLifespan) * (resourcesReserved/totalResources)
   */
  const calculateEmbodiedCarbon = (input: PluginParams) => {
    const totalEmissions = parseNumberInput(
      input['device/emissions-embodied'],
      'gCO2e'
    );
    const duration = parseNumberInput(input['duration'], 'seconds');
    const expectedLifespan = parseNumberInput(
      input['device/expected-lifespan'],
      'seconds'
    );
    const resourcesReserved = parseNumberInput(
      input['vcpus-allocated'] || input['resources-reserved'],
      'count'
    );
    const totalResources = parseNumberInput(
      input['vcpus-total'] || input['resources-total'],
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
      'device/emissions-embodied': z.number().gte(0).min(0),
      'device/expected-lifespan': z.number().gte(0).min(0),
      'vcpus-allocated': z.number().gte(0).min(0),
      'vcpus-total': z.number().gte(0).min(0),
      duration: z.number().gte(1),
    });

    const schemaWithResources = z.object({
      'device/emissions-embodied': z.number().gte(0).min(0),
      'device/expected-lifespan': z.number().gte(0).min(0),
      'resources-reserved': z.number().gte(0).min(0),
      'resources-total': z.number().gte(0).min(0),
      duration: z.number().gte(1),
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
