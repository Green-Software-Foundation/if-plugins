import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';
import {CoefficientConfig} from './types';
const {InputValidationError} = ERRORS;

export const Coefficient = (
  globalConfig: CoefficientConfig
): PluginInterface => {
  const errorBuilder = buildErrorMessage(Coefficient.name);
  const inputParameter = globalConfig['input-parameter'];
  const coefficient = globalConfig['coefficient'];
  const outputParameter = globalConfig['output-parameter'];
  const metadata = {
    kind: 'execute',
  };

  /**Checks global confiog value are valid */
  const validateGlobalConfig = () => {
    if (!inputParameter || inputParameter === '') {
      throw new InputValidationError(
        errorBuilder({
          message: 'No input parameter was provided in global config',
        })
      );
    }

    if (!coefficient) {
      throw new InputValidationError(
        errorBuilder({
          message: 'The coefficient is missing from global config',
        })
      );
    }

    if (!outputParameter || outputParameter === '') {
      throw new InputValidationError(
        errorBuilder({
          message: 'The output parameter name was missing from global config',
        })
      );
    }
  };

  /**
   * Calculate the product of each input parameter.
   */
  const execute = async (inputs: PluginParams[]): Promise<PluginParams[]> => {
    validateGlobalConfig();
    inputs.map(input => {
      return calculateProduct(input);
    });
    return inputs;
  };

  /**
   * Calculates the product of the energy components.
   */
  const calculateProduct = (input: PluginParams) => {
    input[outputParameter] = input[inputParameter] * coefficient;
  };

  return {
    metadata,
    execute,
  };
};
