import {z} from 'zod';

import {PluginInterface} from '../../interfaces';
import {ConfigParams, PluginParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';

export const EMem = (globalConfig: ConfigParams): PluginInterface => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = async (inputs: PluginParams[], config?: ConfigParams) => {
    const mergedConfig = Object.assign({}, globalConfig, config);
    const validatedGlobalConfig = validateConfig(mergedConfig);

    return inputs.map((input: PluginParams) => {
      const inputWithConfigs: PluginParams = Object.assign(
        {},
        input,
        validatedGlobalConfig
      );

      validateSingleInput(input);

      return {
        ...input,
        'energy-memory': calculateEnergy(inputWithConfigs),
      };
    });
  };

  /**
   * Calculates the energy consumption for a single input.
   */
  const calculateEnergy = (input: PluginParams) => {
    const {
      'memory/capacity': totalMemory,
      'memory/utilization': memoryUtil,
      'energy-per-gb': energyPerGB,
    } = input;

    // GB * kWh/GB == kWh
    return totalMemory * (memoryUtil / 100) * energyPerGB;
  };

  const validateConfig = (config: ConfigParams) => {
    const schema = z.object({
      'energy-per-gb': z.number().gt(0),
    });

    //Manually add default value
    config['energy-per-gb'] = config['energy-per-gb'] ?? 0.38;

    return validate<z.infer<typeof schema>>(schema, config);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams) => {
    const schema = z
      .object({
        'memory/capacity': z.number().gt(0),
        'memory/utilization': z.number().min(0).max(100),
      })
      .refine(allDefined, {
        message:
          'All metrics, including memory/utilization, memory/capacity, energy-per-gb, and mem_util-out should be present.',
      });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  return {
    metadata,
    execute,
  };
};
