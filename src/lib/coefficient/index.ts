import {z} from 'zod';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';

import {validate} from '../../util/validations';

import {CoefficientConfig} from './types';

export const Coefficient = (
  globalConfig: CoefficientConfig
): PluginInterface => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    const globalConfigSchema = z.object({
      coefficient: z.number(),
      'input-parameter': z.string().min(1),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof globalConfigSchema>>(
      globalConfigSchema,
      globalConfig
    );
  };

  /**
   * Calculate the product of each input parameter.
   */
  const execute = async (inputs: PluginParams[]) => {
    const safeGlobalConfig = validateGlobalConfig();
    const inputParameter = safeGlobalConfig['input-parameter'];
    const outputParameter = safeGlobalConfig['output-parameter'];
    const coefficient = safeGlobalConfig['coefficient'];

    return inputs.map(input => {
      return {
        ...input,
        [outputParameter]: calculateProduct(input, inputParameter, coefficient),
      };
    });
  };

  /**
   * Calculates the product of the energy components.
   */
  const calculateProduct = (
    input: PluginParams,
    inputParameter: string,
    coefficient: number
  ) => input[inputParameter] * coefficient;

  return {
    metadata,
    execute,
  };
};
