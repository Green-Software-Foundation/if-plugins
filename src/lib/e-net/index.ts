import {z} from 'zod';

import {validate} from '../../util/validations';

import {PluginInterface} from '../../interfaces';
import {ConfigParams, PluginParams} from '../../types/common';

export const ENet = (globalConfig?: ConfigParams): PluginInterface => {
  const metadata = {
    kind: 'execute',
  };
  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = async (inputs: PluginParams[], config?: ConfigParams) => {
    const mergedConfig = Object.assign({}, globalConfig, config);
    const validatedConfig = validateConfig(mergedConfig);

    return inputs.map((input: PluginParams) => {
      const inputWithConfigs: PluginParams = Object.assign(
        {},
        input,
        validatedConfig
      );

      validateSingleInput(inputWithConfigs);

      return {
        ...input,
        'energy-network': calculateEnergy(inputWithConfigs),
      };
    });
  };

  /**
   * Validates global and node config parameters.
   */
  const validateConfig = (config: ConfigParams) => {
    const schema = z.object({
      'energy-per-gb': z.number(),
    });

    //Manually add default value
    if (!config['energy-per-gb'] || config['energy-per-gb'] === 0) {
      config['energy-per-gb'] = 0.001;
    }

    return validate<z.infer<typeof schema>>(schema, config);
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
      'energy-per-gb': z.number(),
      'network/data-in': z.number().gte(0).min(0),
      'network/data-out': z.number().gte(0).min(0),
    });

    //Manually add default value
    if (!input['energy-per-gb'] || input['energy-per-gb'] === 0) {
      input['energy-per-gb'] = 0.001;
    }

    return validate<z.infer<typeof schema>>(schema, input);
  };

  return {
    metadata,
    execute,
  };
};
