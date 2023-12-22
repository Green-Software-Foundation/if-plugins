import {ModelPluginInterface} from '../../interfaces';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';

import {ModelParams} from '../../types/common';

const {InputValidationError} = ERRORS;

export class SciOModel implements ModelPluginInterface {
  staticParams: object | undefined;
  name: string | undefined;
  errorBuilder = buildErrorMessage(SciOModel);

  /**
   * Calculate the total emissions for a list of inputs.
   *
   * Each input require:
   * @param {Object[]} inputs
   * @param {string} inputs[].timestamp RFC3339 timestamp string
   */
  async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    return inputs.map((input: ModelParams, index: number) => {
      if (!('grid-carbon-intensity' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: `'grid-carbon-intensity' is missing from input[${index}]`,
          })
        );
      }

      if (!('energy' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: `'energy' is missing from input[${index}].`,
          })
        );
      }

      this.configure(input);
      const grid_ci = parseFloat(input['grid-carbon-intensity']);
      const energy = parseFloat(input['energy']);
      input['operational-carbon'] = grid_ci * energy;

      return input;
    });
  }

  async configure(
    staticParams: object | undefined
  ): Promise<ModelPluginInterface> {
    this.staticParams = staticParams;

    return this;
  }
}
