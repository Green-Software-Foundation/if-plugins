import {z} from 'zod';

import {validate, allDefined} from '../../util/validations';

import {ModelPluginInterface} from '../../interfaces';
import {ModelParams} from '../../types/common';

export class EMemModel implements ModelPluginInterface {
  /**
   * Configures the E-Mem Plugin.
   */
  public async configure(): Promise<ModelPluginInterface> {
    return this;
  }

  /**
   * Calculate the total emissions for a list of inputs.
   */
  public async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    return inputs.map((input: ModelParams) => {
      const safeInput = this.validateSingleInput(input);
      safeInput['energy-memory'] = this.calculateEnergy(safeInput);

      return safeInput;
    });
  }

  /**
   * Calculates the energy consumption for a single input.
   */
  private calculateEnergy(input: ModelParams) {
    const {
      'total-memoryGB': totalMemory,
      'mem-util': memoryUtil,
      coefficient,
    } = input;

    // GB * kWh/GB == kWh
    return totalMemory * (memoryUtil / 100) * coefficient;
  }

  /**
   * Checks for required fields in input.
   */
  private validateSingleInput(input: ModelParams) {
    const schema = z
      .object({
        'total-memoryGB': z.number().gt(0),
        coefficient: z.number().gt(0).default(0.38),
        'mem-util': z.number().min(0).max(100),
      })
      .refine(allDefined, {
        message:
          'All metrics, including mem-util, total-memoryGB, coefficient, and mem_util-out should be present.',
      });

    return validate(schema, input);
  }
}
