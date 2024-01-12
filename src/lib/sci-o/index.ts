import {z} from 'zod';

import {ModelPluginInterface} from '../../interfaces';
import {ModelParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';

export class SciOModel implements ModelPluginInterface {
  private METRICS = ['grid-carbon-intensity', 'energy'];

  /**
   * Configures the SCI-O Plugin.
   */
  public async configure(): Promise<ModelPluginInterface> {
    return this;
  }

  /**
   * Calculate the total emissions for a list of inputs.
   */
  public async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    return inputs.map(input => {
      const safeInput = this.validateSingleInput(input);

      safeInput['operational-carbon'] =
        parseFloat(safeInput[this.METRICS[0]]) *
        parseFloat(safeInput[this.METRICS[1]]);

      return safeInput;
    });
  }

  /**
   * Checks for required fields in input.
   */
  private validateSingleInput(input: ModelParams) {
    const schema = z
      .object({
        'grid-carbon-intensity': z.number().min(0).default(0),
        energy: z.number().min(0).default(0),
      })
      .refine(allDefined, {
        message: `Both ${this.METRICS} should present.`,
      });

    return validate(schema, input);
  }
}
