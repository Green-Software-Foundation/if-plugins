import {z} from 'zod';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';

import {validate, atLeastOneDefined} from '../../util/validations';

export const SciE = (): PluginInterface => {
  const energyMetrics = ['energy-cpu', 'energy-memory', 'energy-network'];

  const metadata = {
    kind: 'execute',
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = async (inputs: PluginParams[]): Promise<PluginParams[]> =>
    inputs.map(input => ({
      ...input,
      energy: calculateEnergy(input),
    }));

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams) => {
    const schema = z
      .object({
        'energy-cpu': z.number().gte(0).min(0).optional(),
        'energy-memory': z.number().gte(0).min(0).optional(),
        'energy-network': z.number().gte(0).min(0).optional(),
      })
      .refine(atLeastOneDefined, {
        message: `At least one of ${energyMetrics} should present.`,
      });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  /**
   * Calculates the sum of the energy components.
   */
  const calculateEnergy = (input: PluginParams) => {
    const safeInput: {[key: string]: number} = Object.assign(
      input,
      validateSingleInput(input)
    );

    return energyMetrics.reduce((acc, metric) => {
      if (safeInput && safeInput[metric]) {
        acc += safeInput[metric];
      }

      return acc;
    }, 0);
  };

  return {
    metadata,
    execute,
  };
};
