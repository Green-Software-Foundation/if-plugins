import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';
import {SumConfig} from '../../types/sum';

const {InputValidationError} = ERRORS;

export const Sum = (globalConfig: SumConfig): PluginInterface => {
  const errorBuilder = buildErrorMessage(Sum.name);
  const inputParameters = globalConfig.inputParameters || [];
  const outputParameter = globalConfig.outputParameter;
  const metadata = {
    kind: 'execute',
  };

  const validateInputs = (
    inputParameters: string[],
    outputParameter: string
  ) => {
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
    validateInputs(inputParameters, outputParameter);
    inputs.map(input => {
      const safeInput = validateSingleInput(input);
      return calculateSum(safeInput, inputParameters, outputParameter);
    });
    return inputs;
  };

  /**
   * Calculates the sum of the energy components.
   */
  const calculateSum = (
    input: PluginParams,
    inputParameters: string[],
    outputParameter: string
  ) => {
    input[outputParameter] = inputParameters.reduce(
      (accumulator, metricToSum) => {
        return accumulator + input[metricToSum];
      },
      0
    );
  };

  return {
    metadata,
    execute,
  };
};
