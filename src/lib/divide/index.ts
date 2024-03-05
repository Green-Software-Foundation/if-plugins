import {z} from 'zod';

import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';
import {validate} from '../../util/validations';

import {PluginInterface} from '../../interfaces';
import {ConfigParams, PluginParams} from '../../types/common';

const {InputValidationError, ConfigValidationError} = ERRORS;

export const Divide = (globalConfig: ConfigParams): PluginInterface => {
  const errorBuilder = buildErrorMessage(Divide.name);
  const metadata = {
    kind: 'execute',
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    if (!globalConfig) {
      throw new ConfigValidationError(
        errorBuilder({message: 'Configuration data is missing'})
      );
    }
    const schema = z.object({
      numerator: z.string().min(1),
      denominator: z.string().or(z.number().gt(0)),
      output: z.string(),
    });

    return validate<z.infer<typeof schema>>(schema, globalConfig);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    numerator: string,
    denominator: number | string
  ) => {
    const schema = z
      .object({
        [numerator]: z.number(),
        [denominator]: z.number().optional(),
      })
      .refine(_data => {
        if (typeof denominator === 'string' && !input[denominator]) {
          throw new InputValidationError(
            errorBuilder({
              message: `\`${denominator}\` is missing from the input`,
            })
          );
        }
        return true;
      });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  /**
   * Calculate the division of each input parameter.
   */
  const execute = async (inputs: PluginParams[]) => {
    const safeGlobalConfig = validateGlobalConfig();
    const {numerator, denominator, output} = safeGlobalConfig;

    return inputs.map(input => {
      const safeInput = Object.assign(
        {},
        input,
        validateSingleInput(input, numerator, denominator)
      );

      return {
        ...input,
        [output]: calculateDivide(safeInput, numerator, denominator),
      };
    });
  };

  /**
   * Calculates the division of the given parameter.
   */
  const calculateDivide = (
    input: PluginParams,
    numerator: string,
    denominator: number | string
  ) => input[numerator] / (input[denominator] || denominator);

  return {
    metadata,
    execute,
  };
};
