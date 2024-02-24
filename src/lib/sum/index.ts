import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';
import {SumConfig} from './types';

const {InputValidationError} = ERRORS;

export const Sum = (globalConfig: SumConfig): PluginInterface => {
  const errorBuilder = buildErrorMessage(Sum.name);
  const inputParameters = globalConfig['input-parameters'] || [];
  const outputParameter = globalConfig['output-parameter'];
  const metadata = {
    kind: 'execute',
  };

  /**
   * Checks global config value are valid.
   */
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
    validateGlobalConfig();

    return inputs.map(input => {
      const safeInput = validateSingleInput(input);

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
