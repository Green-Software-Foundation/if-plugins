import {z} from 'zod';

import {validate, allDefined} from '../../util/validations';

import {ModelPluginInterface} from '../../interfaces';
import {ModelParams} from '../../types/common';

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
      const safeInput = Object.assign(input, this.validateSingleInput(input));

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
        'grid-carbon-intensity': z.number().min(0),
        energy: z.number().min(0),
      })
      .refine(allDefined, {
        message: `Both ${this.METRICS} should present.`,
      });

    return validate<z.infer<typeof schema>>(schema, input);
  }
}
