import { PluginInterface } from '../../interfaces';
import { PluginParams } from '../../types/common';


type sumConfig = {
  inputParameters: string[],
  outputParameter: string
}


export const Sum = (globalConfig: sumConfig): PluginInterface => {

  const inputParameters = globalConfig.inputParameters;
  const outputParameter = globalConfig.outputParameter
  const metadata = {
    kind: 'execute',
  };

  /**
   * Calculate the sum of each .
   */
  const execute = async (inputs: PluginParams[]): Promise<PluginParams[]> => {
    inputs.map(input => {
      return calculateSum(input, inputParameters, outputParameter)
    }
    );
    return inputs
  };


  /**
   * Calculates the sum of the energy components.
   */
  const calculateSum = (input: PluginParams, inputParameters: string[], outputParameter: string) => {

    var sum = 0;
    inputParameters.forEach(metricToSum => {
      sum += input[metricToSum]
    })
    return input[outputParameter] = sum

  };

  return {
    metadata,
    execute,
  };
};
