import {ModelPluginInterface} from '../../interfaces';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';

import {ModelParams} from '../../types/common';

const {InputValidationError} = ERRORS;

export class ENetModel implements ModelPluginInterface {
  authParams: object | undefined; // Defined for compatibility. Not used in this.
  staticParams: object | undefined;

  errorBuilder = buildErrorMessage(ENetModel);

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
      input['energy-network'] = this.calculateEnergy(input);
      return input;
    });
  }

  /**
   * Calculates the energy consumption for a single input
   * requires
   *
   * data-in: inbound data [GB]
   * data-out: outbound data [GB]
   * network-energy-coefficient: network energy cofficient [kWh/GB]
   *
   * multiplies (data-in + data-out) by network-energy-coefficient
   */
  private calculateEnergy(input: ModelParams) {
    this.validateInput(input);
    const data_in = input['data-in'];
    const data_out = input['data-out'];
    const net_energy = input['network-energy-coefficient'];
    return (data_in + data_out) * net_energy;
  }

  private validateInput(input: ModelParams) {
    this.validateFieldInInput(input, 'data-in');
    this.validateFieldInInput(input, 'data-out');
    this.validateFieldInInput(input, 'network-energy-coefficient');
  }

  private validateFieldInInput(input: ModelParams, field: string) {
    if (field === 'network-energy-coefficient') {
      if (
        !(field in input) ||
        input[field] === undefined ||
        input[field] === 0
      ) {
        input['network-energy-coefficient'] = 0.001; // default value taken from msft-eshoppen case study
      }
    } else {
      if (!(field in input) || input[field] === undefined) {
        throw new InputValidationError(
          this.errorBuilder({
            message: field + ' is missing or invalid',
          })
        );
      }
    }
  }
}
