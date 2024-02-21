import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';
const {InputValidationError} = ERRORS;

type MultiplyConfig = {
  inputParameters: string[];
  outputParameter: string;
};

export const Multiply = (globalConfig: MultiplyConfig): PluginInterface => {
  const errorBuilder = buildErrorMessage(Multiply.name);
  const inputParameters = globalConfig.inputParameters;
  const outputParameter = globalConfig.outputParameter;
  const metadata = {
    kind: 'execute',
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams) => {
    inputParameters.forEach(metricToMultiply => {
      if (!Object.getOwnPropertyDescriptor(input, metricToMultiply)) {
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
   * Calculate the sum of each .
   */
  const execute = async (inputs: PluginParams[]): Promise<PluginParams[]> => {
    inputs.map(input => {
      const safeInput = validateSingleInput(input);
      return calculateProduct(safeInput, inputParameters, outputParameter);
    });
    return inputs;
  };

  /**
   * Calculates the sum of the energy components.
   */
  const calculateProduct = (
    input: PluginParams,
    inputParameters: string[],
    outputParameter: string
  ) => {
    // in first iteration, 1 * metric == metric.
    let product = 1;
    inputParameters.forEach(metricToSum => {
      product = product * input[metricToSum];
    });
    return (input[outputParameter] = product);
  };

  return {
    metadata,
    execute,
  };
};
