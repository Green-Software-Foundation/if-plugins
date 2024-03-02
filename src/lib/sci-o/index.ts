import {z} from 'zod';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';

export const SciO = (): PluginInterface => {
  const METRICS = ['grid/carbon-intensity', 'energy'];
  const metadata = {
    kind: 'execute',
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = async (inputs: PluginParams[]) =>
    inputs.map(input => {
      const safeInput = Object.assign({}, input, validateSingleInput(input));

      return {
        ...input,
        'carbon-operational': calculateOperationalCarbon(safeInput),
      };
    });

  /**
   * Calculate the Operational carbon for the input.
   */
  const calculateOperationalCarbon = (input: PluginParams) => {
    return parseFloat(input[METRICS[0]]) * parseFloat(input[METRICS[1]]);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams) => {
    const schema = z
      .object({
        'grid/carbon-intensity': z.number().min(0),
        energy: z.number().min(0),
      })
      .refine(allDefined, {
        message: `Both ${METRICS} should present.`,
      });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  return {
    metadata,
    execute,
  };
};
