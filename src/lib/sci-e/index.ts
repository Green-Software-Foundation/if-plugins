import {z} from 'zod';

import {ModelPluginInterface} from '../../interfaces';

import {ModelParams} from '../../types/common';
import {validate} from '../../util/validations';

export class SciEModel implements ModelPluginInterface {
  /**
   * Configures the SCI-E Plugin.
   */
  public async configure(): Promise<ModelPluginInterface> {
    return Promise.resolve(this);
  }

  /**
   * Calculate the total emissions for a list of inputs.
   */
  public async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    return inputs.map(input => {
      input['energy'] = this.calculateEnergy(input);

      return input;
    });
  }

  /**
   * Checks for required fields in input.
   */
  private validateSingleInput(input: ModelParams) {
    const schema = z.object({
      'energy-cpu': z.number().gte(0).min(0),
      'energy-memory': z.number().gte(0).min(0),
      'energy-network': z.number().gte(0).min(0),
    });

    return validate(schema, input);
  }

  /**
   * Calculates the sum of the energy components.
   */
  private calculateEnergy(input: ModelParams) {
    const safeInput = this.validateSingleInput(input);

    const energyMetrics = ['energy-cpu', 'energy-memory', 'energy-network'];

    return energyMetrics.reduce((acc, metric) => {
      acc += safeInput[metric];

      return acc;
    }, 0);
  }
}
