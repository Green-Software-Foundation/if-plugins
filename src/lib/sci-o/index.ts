import {ModelPluginInterface} from '../../interfaces';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';

import {KeyValuePair} from '../../types/common';

const {InputValidationError} = ERRORS;

export class SciOModel implements ModelPluginInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  errorBuilder = buildErrorMessage(SciOModel.name);

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   * Calculate the total emissions for a list of inputs.
   *
   * Each input require:
   * @param {Object[]} inputs
   * @param {string} inputs[].timestamp RFC3339 timestamp string
   */
  async execute(inputs: object | object[] | undefined): Promise<any[]> {
    if (inputs === undefined) {
      throw new InputValidationError(
        this.errorBuilder({message: 'Input data is missing'})
      );
    }

    if (!Array.isArray(inputs)) {
      throw new InputValidationError(
        this.errorBuilder({message: 'Input data is not an array'})
      );
    }

    return inputs.map((input: KeyValuePair, index: number) => {
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
