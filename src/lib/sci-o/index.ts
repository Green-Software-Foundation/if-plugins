import {z} from 'zod';
import {ModelPluginInterface} from '../../interfaces';

import {buildErrorMessage} from '../../util/helpers';
import {validate} from '../../util/validations';

import {ModelParams} from '../../types/common';

export class SciOModel implements ModelPluginInterface {
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
      this.validateSingleInput(input);

      input['operational-carbon'] =
        parseFloat(input['grid-carbon-intensity']) *
        parseFloat(input['energy']);

      return input;
    });
  }

  /**
   * Checks for required fields in input.
   */
  private validateSingleInput(input: ModelParams) {
    const schema = z.object({
      'grid-carbon-intensity': z.number().min(0).default(0),
      energy: z.number().min(0).default(0),
    });

    return validate(schema, input);
  }
}
