import {z} from 'zod';

import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';
import {validate} from '../../util/validations';

import {PluginInterface} from '../../interfaces';
import {ConfigParams, PluginParams} from '../../types/common';

const {InputValidationError, ConfigValidationError} = ERRORS;

export const Regex = (globalConfig: ConfigParams): PluginInterface => {
  const errorBuilder = buildErrorMessage(Regex.name);
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
      'input-parameter': z.string().min(1),
      match: z.string().min(1),
      output: z.string(),
    });

    return validate<z.infer<typeof schema>>(schema, globalConfig);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams, inputParameter: string) => {
    if (!input[inputParameter]) {
      throw new InputValidationError(
        errorBuilder({
          message: `\`${inputParameter}\` is missing from the input`,
        })
      );
    }

    return input;
  };

  /**
   * Executes the regex of the given parameter.
   */
  const execute = async (inputs: PluginParams[]) => {
    const safeGlobalConfig = validateGlobalConfig();
    const {'input-parameter': inputParameter, match, output} = safeGlobalConfig;

    return inputs.map(input => {
      const safeInput = Object.assign(
        {},
        input,
        validateSingleInput(input, inputParameter)
      );

      return {
        ...input,
        [output]: calculateRegex(safeInput, inputParameter, match),
      };
    });
  };

  /**
   * Calculates the regex of the given parameter.
   */
  const calculateRegex = (
    input: PluginParams,
    inputParameter: string,
    match: string | RegExp
  ) => {
    const regex = new RegExp(match);
    const matchedItem = regex.exec(input[inputParameter]);

    return (matchedItem && matchedItem[0]) || null;
  };

  return {
    metadata,
    execute,
  };
};
