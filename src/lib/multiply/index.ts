import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';
import {MultiplyConfig} from './types';
const {InputValidationError} = ERRORS;

export const Multiply = (globalConfig: MultiplyConfig): PluginInterface => {
  const errorBuilder = buildErrorMessage(Multiply.name);
  const inputParameters = globalConfig['input-parameters'] || [];
  const outputParameter = globalConfig['output-parameter'];
  const metadata = {
    kind: 'execute',
  };

  /**Checks global confiog value are valid */
  const validateGlobalConfig = () => {
    if (inputParameters.length === 0) {
      throw new InputValidationError(
        errorBuilder({
          message: 'No input parameters were provided in global config.',
        })
      );
    }
    if (inputParameters.length === 1) {
      throw new InputValidationError(
        errorBuilder({
          message:
            'Only one input parameter was provided in global config. Cannot calculate sum of one number.',
        })
      );
    }
    if (!outputParameter || outputParameter === '') {
      throw new InputValidationError(
        errorBuilder({
          message:
            'The output parameter name was missing. Please provide one in global config',
        })
      );
    }
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams) => {
    inputParameters.forEach(metricToMultiply => {
      if (!input[metricToMultiply]) {
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
    validateGlobalConfig();
    inputs.map(input => {
      const safeInput = validateSingleInput(input);
      return calculateProduct(safeInput);
    });
    return inputs;
  };

  /**
   * Calculates the product of the energy components.
   */
  const calculateProduct = (input: PluginParams) => {
    input[outputParameter] = inputParameters.reduce(
      (accumulator, metricToMultiply) => {
        return accumulator * input[metricToMultiply];
      },
      1
    );
  };

  return {
    metadata,
    execute,
  };
};
