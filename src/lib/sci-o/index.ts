import {z} from 'zod';
import {ModelPluginInterface} from '../../interfaces';

import {buildErrorMessage} from '../../util/helpers';
import {validate, allDefined} from '../../util/validations';

import {ModelParams} from '../../types/common';

export class SciOModel implements ModelPluginInterface {
  private METRICS = ['grid-carbon-intensity', 'energy'];
  errorBuilder = buildErrorMessage(SciOModel);

  /**
   * Configures the SCI-O Plugin.
   */
  async configure(): Promise<ModelPluginInterface> {
    return Promise.resolve(this);
  }

  /**
   * Calculate the total emissions for a list of inputs.
   *
   * Each input require:
   * @param {Object[]} inputs
   * @param {string} inputs[].timestamp RFC3339 timestamp string
   */
  async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    return inputs.map((input: ModelParams) => {
      const safeInput = this.validateSingleInput(input);

      input['operational-carbon'] =
        parseFloat(safeInput[this.METRICS[0]]) *
        parseFloat(safeInput[this.METRICS[1]]);

      return input;
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
