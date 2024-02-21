import { PluginInterface } from '../../interfaces';
import { PluginParams } from '../../types/common';
import { buildErrorMessage } from '../../util/helpers';
import { ERRORS } from '../../util/errors';
const { InputValidationError } = ERRORS;

type sumConfig = {
  inputParameters: string[];
  outputParameter: string;
};

export const Sum = (globalConfig: sumConfig): PluginInterface => {
  const errorBuilder = buildErrorMessage(Sum.name);
  const inputParameters = globalConfig.inputParameters;
  const outputParameter = globalConfig.outputParameter;
  const metadata = {
    kind: 'execute',
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

    input[outputParameter] = inputParameters.reduce((accumulator, metricToSum) => {
      return accumulator + input[metricToSum];
    }, 0);
  }

  return {
    metadata,
    execute,
  };
};
