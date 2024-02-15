import {z} from 'zod';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';
import {mapPluginName} from '../../util/helpers';

export const EMem = (globalConfig?: Record<string, any>): PluginInterface => {
  const MAPPED_NAME = mapPluginName(EMem.name);
  const metadata = {
    kind: 'execute',
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = async (
    inputs: PluginParams[],
    config?: Record<string, any>
  ) => {
    const mappedConfig = config && config[MAPPED_NAME];

    return inputs.map((input: PluginParams) => {
      const inputWithConfigs: PluginParams = Object.assign(
        {},
        input,
        mappedConfig,
        globalConfig
      );
      const safeInput = Object.assign(
        {},
        input,
        validateSingleInput(inputWithConfigs)
      );

      return {
        ...input,
        'energy-memory': calculateEnergy(safeInput),
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

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams) => {
    const schema = z
      .object({
        'memory/capacity': z.number().gt(0),
        'energy-per-gb': z.number().gt(0),
        'memory/utilization': z.number().min(0).max(100),
      })
      .refine(allDefined, {
        message:
          'All metrics, including memory/utilization, memory/capacity, energy-per-gb, and mem_util-out should be present.',
      });

    //Manually add default value
    input['energy-per-gb'] = input['energy-per-gb'] ?? 0.38;

    return validate<z.infer<typeof schema>>(schema, input);
  };

  return {
    metadata,
    execute,
  };
};
