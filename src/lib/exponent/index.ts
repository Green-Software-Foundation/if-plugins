import {z} from 'zod';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';
import {validate} from '../../util/validations';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';
import {ExponentConfig} from './types';

const {InputValidationError} = ERRORS;

export const Exponent = (globalConfig: ExponentConfig): PluginInterface => {
  const errorBuilder = buildErrorMessage(Exponent.name);
  const metadata = {
    kind: 'execute',
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    const globalConfigSchema = z.object({
      'input-parameter': z.string().min(1),
      exponent: z.number().min(1),
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
  const validateSingleInput = (input: PluginParams, inputParameter: string) => {
    validateParamExists(input, inputParameter);
    validateNumericString(input[inputParameter]);
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
    if (typeof str !== 'number') {
      throw new InputValidationError(
        errorBuilder({
          message: `${str} is not numeric`,
        })
      );
    }
  };

  /**
   * Calculate the input param raised by to the power of the given exponent.
   */
  const execute = async (inputs: PluginParams[]): Promise<PluginParams[]> => {
    const {
      'input-parameter': inputParameter,
      exponent: exponent,
      'output-parameter': outputParameter,
    } = validateGlobalConfig();
    return inputs.map(input => {
      validateSingleInput(input, inputParameter);

      return {
        ...input,
        [outputParameter]: calculateExponent(input, inputParameter, exponent),
      };
    });
  };

  /**
   * Calculates the input param raised by the power of a given exponent.
   */
  const calculateExponent = (
    input: PluginParams,
    inputParameter: string,
    exponent: number
  ) => {
    const base = input[inputParameter];
    return Math.pow(base, exponent);
  };

  return {
    metadata,
    execute,
  };
};
