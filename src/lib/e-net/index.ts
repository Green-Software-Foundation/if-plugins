import {z} from 'zod';

import {ModelPluginInterface} from '../../interfaces';
import {ModelParams} from '../../types/common';

import {validate} from '../../util/validations';

export class ENetModel implements ModelPluginInterface {
  /**
   * Configures the E-Net Plugin.
   */
  public async configure(): Promise<ENetModel> {
    return this;
  }

  /**
   * Calculate the total emissions for a list of inputs.
   */
  public async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    return inputs.map((input: ModelParams) => {
      const safeInput = this.validateSingleInput(input);
      safeInput['energy-network'] = this.calculateEnergy(safeInput);

      return safeInput;
    });
  }

  /**
   * Calculates the energy consumption for a single input.
   */
  private calculateEnergy(input: ModelParams) {
    const {
      'data-in': dataIn,
      'data-out': dataOut,
      'network-energy-coefficient': netEnergy,
    } = input;

    return (dataIn + dataOut) * netEnergy;
  }

  /**
   * Checks for required fields in input.
   */
  private validateSingleInput(input: ModelParams) {
    const schema = z.object({
      'network-energy-coefficient': z
        .number()
        .transform(value => (!value || value === 0 ? 0.001 : value))
        .default(0.001),
      'data-in': z.number().gte(0).min(0),
      'data-out': z.number().gte(0).min(0),
    });

    return validate(schema, input);
  }
}
