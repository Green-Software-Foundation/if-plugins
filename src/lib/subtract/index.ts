import {z} from 'zod';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';
import {validate} from '../../util/validations';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';
import {SubtractConfig} from './types';

const {InputValidationError} = ERRORS;

export const Subtract = (globalConfig: SubtractConfig): PluginInterface => {
  const errorBuilder = buildErrorMessage(Subtract.name);
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
    inputParameters.forEach(metricToSubtract => {
      validateParamExists(input, metricToSubtract);
      validateNumericString(input[metricToSubtract]);
    });

    return input;
  };

  const validateParamExists = (input: PluginParams, param: string) => {
    if (input[param] === undefined) {
      throw new InputValidationError(
        errorBuilder({
          message: `${param} is missing from the input array`,
        })
      );
    }
  };

  const validateNumericString = (str: string) => {
    if (isNaN(+Number(str))) {
      throw new InputValidationError(
        errorBuilder({
          message: `${str} is not numberic`,
        })
      );
    }
  };

  /**
   * Subtract items from inputParams[1..n] from inputParams[0] and write the result in a new param outputParam.
   */
  const execute = async (inputs: PluginParams[]): Promise<PluginParams[]> => {
    const {
      'input-parameters': inputParameters,
      'output-parameter': outputParameter,
    } = validateGlobalConfig();
    return inputs.map(input => {
      validateSingleInput(input, inputParameters);

      return {
        ...input,
        [outputParameter]: calculateDiff(input, inputParameters),
      };
    });
  };

  /**
   * Calculates the diff between the 1st item in the inputs nad the rest of the items
   */
  const calculateDiff = (input: PluginParams, inputParameters: string[]) => {
    const [firstItem, ...restItems] = inputParameters;
    return restItems.reduce(
      (accumulator, metricToSubtract) => accumulator - input[metricToSubtract],
      input[firstItem] // Starting accumulator with the value of the first item
    );
  };

  return {
    metadata,
    execute,
  };
};
