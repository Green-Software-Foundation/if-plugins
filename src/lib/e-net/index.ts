import {z} from 'zod';

import {validate} from '../../util/validations';

import {PluginInterface} from '../../interfaces';
import {ConfigParams, PluginParams} from '../../types/common';

export const ENet = (globalConfig: ConfigParams): PluginInterface => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = async (inputs: PluginParams[]) => {
    const validatedConfig = validateConfig();

    return inputs.map((input: PluginParams) => {
      const inputWithConfig: PluginParams = Object.assign(
        {},
        validateSingleInput(input),
        validatedConfig
      );

      return {
        ...input,
        'network/energy': calculateEnergy(inputWithConfig),
      };
    });
  };

  /**
   * Validates global and node config parameters.
   */
  const validateConfig = () => {
    const schema = z.object({
      'energy-per-gb': z.number().gte(0.001),
    });

    // Manually add default value from CCF: https://www.cloudcarbonfootprint.org/docs/methodology/#chosen-coefficient
    const energyPerGB =
      (globalConfig && globalConfig['energy-per-gb']) ?? 0.001;

    return validate<z.infer<typeof schema>>(schema, {
      ...globalConfig,
      'energy-per-gb': energyPerGB,
    });
  };

  /**
   * Calculates the energy consumption for a single input.
   */
  const calculateEnergy = (input: PluginParams) => {
    const {
      'network/data-in': dataIn,
      'network/data-out': dataOut,
      'energy-per-gb': netEnergy,
    } = input;

    return (dataIn + dataOut) * netEnergy;
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams) => {
    const schema = z.object({
      'network/data-in': z.number().gte(0).min(0),
      'network/data-out': z.number().gte(0).min(0),
    });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  return {
    metadata,
    execute,
  };
};
