import {z} from 'zod';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';

import {validate, atLeastOneDefined} from '../../util/validations';

export const SciE = (): PluginInterface => {
  const energyMetrics = ['cpu/energy', 'memory/energy', 'network/energy'];
  const metadata = {
    kind: 'execute',
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = async (inputs: PluginParams[]) => {
    return inputs.map(input => {
      const safeInput = Object.assign({}, input, validateSingleInput(input));

      return {
        ...input,
        energy: calculateEnergy(safeInput),
      };
    });
  };
  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams) => {
    const schema = z
      .object({
        'cpu/energy': z.number().gte(0).min(0).optional(),
        'memory/energy': z.number().gte(0).min(0).optional(),
        'network/energy': z.number().gte(0).min(0).optional(),
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
    return energyMetrics.reduce((acc, metric) => {
      if (input && input[metric]) {
        acc += input[metric];
      }

      return acc;
    }, 0);
  };

  return {
    metadata,
    execute,
  };
};
