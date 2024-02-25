import {z} from 'zod';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';
import {validate} from '../../util/validations';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';
import {SumConfig} from './types';

const {InputValidationError} = ERRORS;

export const Sum = (globalConfig: SumConfig): PluginInterface => {
  const errorBuilder = buildErrorMessage(Sum.name);
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
    inputParameters.forEach(metricToSum => {
      if (!input[metricToSum]) {
        throw new InputValidationError(
          errorBuilder({
            message: `${metricToSum} is missing from the input array`,
          })
        );
      }
    });

    return input;
  };

  /**
   * Calculate the sum of each .
   */
  const execute = async (inputs: PluginParams[]): Promise<PluginParams[]> => {
    const safeGlobalConfig = validateGlobalConfig();
    const inputParameters = safeGlobalConfig['input-parameters'];
    const outputParameter = safeGlobalConfig['output-parameter'];

    return inputs.map(input => {
      const safeInput = validateSingleInput(input, inputParameters);

      return {
        ...safeInput,
        [outputParameter]: calculateSum(safeInput, inputParameters),
      };
    });
  };

  /**
   * Calculates the sum of the energy components.
   */
  const calculateSum = (input: PluginParams, inputParameters: string[]) =>
    inputParameters.reduce(
      (accumulator, metricToSum) => accumulator + input[metricToSum],
      0
    );

  return {
    metadata,
    execute,
  };
};
