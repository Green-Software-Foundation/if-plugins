import {ModelPluginInterface} from '../../interfaces';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';

import {ModelParams} from '../../types/common';

const {InputValidationError} = ERRORS;

export class EMemModel implements ModelPluginInterface {
  authParams: object | undefined; // Defined for compatibility. Not used in this.
  staticParams: object | undefined;

  errorBuilder = buildErrorMessage(EMemModel);

  async configure(
    staticParams: object | undefined = undefined
  ): Promise<ModelPluginInterface> {
    if (staticParams === undefined) {
      staticParams = {};
    }
    this.staticParams = staticParams;
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
  async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    if (inputs.length === 0) {
      throw new InputValidationError(
        this.errorBuilder({
          message: 'Input data is missing',
        })
      );
    }
    return inputs.map((input: ModelParams) => {
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
  private calculateEnergy(input: ModelParams) {
    if (!('mem-util' in input) || input['mem-util'] === undefined) {
      throw new InputValidationError(
        this.errorBuilder({
          message: 'mem-util is missing or invalid',
        })
      );
    }

    if (!('total-memoryGB' in input) || input['total-memoryGB'] === undefined) {
      throw new InputValidationError(
        this.errorBuilder({
          message: 'total-memoryGB is missing or invalid',
        })
      );
    }

    if (input['total-memoryGB'] === 0) {
      throw new InputValidationError(
        this.errorBuilder({
          message: "'total-memoryGB' is either not defined or set to zero.",
        })
      );
    }

    if (input['coefficient'] === 0) {
      throw new InputValidationError(
        this.errorBuilder({
          message: "'coefficient' is either set to zero",
        })
      );
    }

    const mem_alloc = input['total-memoryGB'];
    const mem_util = input['mem-util'];
    const memoryEnergy = input['coefficient'] ?? 0.38; //coefficient for GB -> kWh, use 0.38 as default

    if (mem_util < 0 || mem_util > 100) {
      throw new InputValidationError(
        this.errorBuilder({
          message:
            "Invalid value for 'mem-util'. Must be between '0' and '100'",
        })
      );
    }

    // GB * kWh/GB == kWh
    return mem_alloc * (mem_util / 100) * memoryEnergy;
  }
}
