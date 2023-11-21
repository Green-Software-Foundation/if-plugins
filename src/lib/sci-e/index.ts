import {ModelPluginInterface} from '../../interfaces';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';

import {KeyValuePair} from '../../types/common';

const {InputValidationError} = ERRORS;

export class SciEModel implements ModelPluginInterface {
  authParams: object | undefined; // Defined for compatibility. Not used in thi smodel.
  name: string | undefined; // name of the data source
  errorBuilder = buildErrorMessage(SciEModel);

  /**
   * Defined for compatibility. Not used in energy-network.
   */
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   * Configures the sci-e Plugin for IEF
   * @param {string} name name of the resource
   * @param {Object} staticParams static parameters for the resource
   */
  async configure(
    staticParams: object | undefined = undefined
  ): Promise<ModelPluginInterface> {
    if (staticParams === undefined) {
      throw new InputValidationError(
        this.errorBuilder({
          scope: 'configure',
          message: 'Missing input data',
        })
      );
    }

    return this;
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
        this.errorBuilder({
          message: 'Input data is missing',
        })
      );
    }

    if (!Array.isArray(inputs)) {
      throw new InputValidationError(
        this.errorBuilder({
          message: 'Input data is not an array',
        })
      );
    }

    return inputs.map((input: KeyValuePair) => {
      this.configure(input);
      input['energy'] = this.calculateEnergy(input);

      return input;
    });
  }

  /**
   * Calculates the sum of the energy components
   *
   * energy-cpu: cpu energy in kwh
   * energy-memory: energy due to memory usage in kwh
   * energy-network: energy due to network data in kwh
   * timestamp: RFC3339 timestamp string
   *
   * adds energy + e_net + e_mum
   */
  private calculateEnergy(input: KeyValuePair) {
    let e_mem = 0;
    let e_net = 0;
    let e_cpu = 0;

    if (
      !('energy-cpu' in input) &&
      !('energy-memory' in input) &&
      !('energy-network' in input)
    ) {
      throw new InputValidationError(
        this.errorBuilder({
          message:
            "At least one of 'energy-memory', 'energy-network' or 'energy' must be present in 'input'",
          scope: 'calculate-energy',
        })
      );
    }

    // If the user gives a negative value it will default to zero.
    if ('energy-cpu' in input && input['energy-cpu'] > 0) {
      e_cpu = input['energy-cpu'];
    }
    if ('energy-memory' in input && input['energy-memory'] > 0) {
      e_mem = input['energy-memory'];
    }
    if ('energy-network' in input && input['energy-network'] > 0) {
      e_net = input['energy-network'];
    }

    return e_cpu + e_net + e_mem;
  }
}
