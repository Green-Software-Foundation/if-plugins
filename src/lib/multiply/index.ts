import {z} from 'zod';

import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';
import {validate} from '../../util/validations';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';
import {MultiplyConfig} from './types';

const {InputValidationError} = ERRORS;

export const Multiply = (globalConfig: MultiplyConfig): PluginInterface => {
  const errorBuilder = buildErrorMessage(Multiply.name);
  const metadata = {
    kind: 'execute',
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    const globalConfigSchema = z.object({
      'input-parameters': z.array(z.string()),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof globalConfigSchema>>(
      globalConfigSchema,
      globalConfig
    );
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    inputParameters: string[]
  ) => {
    inputParameters.forEach(metricToMultiply => {
      if (
        input[metricToMultiply] === undefined ||
        isNaN(input[metricToMultiply])
      ) {
        throw new InputValidationError(
          errorBuilder({
            message: `${metricToMultiply} is missing from the input array`,
          })
        );
      }
    });

    return input;
  };

  /**
   * Calculate the product of each input parameter.
   */
  const execute = async (inputs: PluginParams[]): Promise<PluginParams[]> => {
    const safeGlobalConfig = validateGlobalConfig();
    const inputParameters = safeGlobalConfig['input-parameters'];
    const outputParameter = safeGlobalConfig['output-parameter'];

    return inputs.map(input => {
      const safeInput = validateSingleInput(input, inputParameters);

      return {
        ...input,
        [outputParameter]: calculateProduct(safeInput, inputParameters),
      };
    });
  };

  /**
   * Calculates the product of the energy components.
   */
  const calculateProduct = (input: PluginParams, inputParameters: string[]) =>
    inputParameters.reduce(
      (accumulator, metricToMultiply) => accumulator * input[metricToMultiply],
      1
    );

  return {
    metadata,
    execute,
  };
};
