import {ModelPluginInterface} from '../../interfaces';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';

import {KeyValuePair, ModelParams} from '../../types/common';

const {InputValidationError} = ERRORS;

export class EMemModel implements ModelPluginInterface {
  authParams: object | undefined; // Defined for compatibility. Not used in this.
  name: string | undefined; // name of the data source
  memoryAllocation = 0;
  memoryEnergy = 0;
  errorBuilder = buildErrorMessage(EMemModel);

  /**
   * Defined for compatibility. Not used.
   */
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   * Configures the Plugin for IEF
   * @param {string} name name of the resource
   * @param {Object} staticParams static parameters for the resource
   * @param {number} staticParams.thermal-design-power Thermal Design Power in Watts
   * @param {Interpolation} staticParams.interpolation Interpolation method
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

    if ('mem-alloc' in staticParams) {
      this.memoryAllocation = staticParams['mem-alloc'] as number;
    }

    if ('mem-energy' in staticParams) {
      this.memoryEnergy = staticParams['mem-energy'] as number;
    }

    return this;
  }

  /**
   * Calculate the total emissions for a list of inputs.
   *
   * Each input require:
   * @param {Object[]} inputs
   * @param {string} inputs[].timestamp RFC3339 timestamp string
   * @param {number} inputs[].mem-util percentage mem usage
   */
  async execute(inputs: ModelParams[]): Promise<any[]> {
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
      input['energy-memory'] = this.calculateEnergy(input);

      return input;
    });
  }

  /**
   * Calculates the energy consumption for a single input
   * requires
   *
   * mem-util: ram usage in percentage
   * timestamp: RFC3339 timestamp string
   *
   * multiplies memory used (GB) by a coefficient (wh/GB) and converts to kwh
   */
  private calculateEnergy(input: KeyValuePair) {
    if (!('mem-util' in input) || !('timestamp' in input)) {
      throw new InputValidationError(
        this.errorBuilder({
          message: "Inputs 'mem-util' or 'timestamp' are not provided",
        })
      );
    }

    if (this.memoryAllocation === 0) {
      throw new InputValidationError(
        this.errorBuilder({
          message: "'mem-alloc' is not passed to configure method",
        })
      );
    }

    if (this.memoryEnergy === 0) {
      throw new InputValidationError(
        this.errorBuilder({
          message: "'mem-energy' is not passed to configure method",
        })
      );
    }

    const mem_alloc = this.memoryAllocation;
    const mem_util = input['mem-util']; // convert cpu usage to percentage

    if (mem_util < 0 || mem_util > 100) {
      throw new InputValidationError(
        this.errorBuilder({
          message:
            "Invalid value for 'mem-util'. Must be between '0' and '100'",
        })
      );
    }

    return (mem_alloc * (mem_util / 100) * this.memoryEnergy) / 1000;
  }
}
