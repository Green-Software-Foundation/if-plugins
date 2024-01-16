import {z} from 'zod';

import {ModelPluginInterface} from '../../interfaces';
import {ModelParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';

import {TIME_UNITS_IN_SECONDS} from '../../config';

const {InputValidationError} = ERRORS;

export class SciModel implements ModelPluginInterface {
  functionalUnitTime = {unit: '', value: 1};
  errorBuilder = buildErrorMessage(this.constructor);

  /**
   * Configures the SCI Plugin.
   */
  public async configure(): Promise<ModelPluginInterface> {
    return this;
  }

  /**
   * Calculate the total emissions for a list of inputs.
   */
  public async execute(inputs: ModelParams[]): Promise<any[]> {
    const tunedInputs = inputs.map(input => {
      const safeInput = this.validateInput(input);
      input = Object.assign(input, safeInput);

      this.parseTime(input);

      const sciSecs = this.calculateSciSeconds(input);
      const sciTimed = this.convertSciToTimeUnit(sciSecs);
      const factor = this.getFunctionalUnitConversionFactor(input);
      const sciTimedDuration = sciTimed * this.functionalUnitTime.value;

      input['carbon'] = input['carbon'] ?? sciSecs;
      input['sci'] = sciTimedDuration / factor;

      return input;
    });

    return tunedInputs;
  }

  /**
   * Gets the conversion factor based on the functional unit specified in the input.
   * If the 'functional-unit' exists in the input and is not 'none' or an empty string,
   * returns the value; otherwise, defaults to 1.
   */
  private getFunctionalUnitConversionFactor(input: ModelParams): number {
    const functionalUnit = input['functional-unit'];

    return functionalUnit in input &&
      input[functionalUnit] !== 'none' &&
      input[functionalUnit] !== ''
      ? input[functionalUnit]
      : 1;
  }

  /**
   * Converts the given sci value from seconds to the specified time unit.
   */
  private convertSciToTimeUnit(sciSecs: number): number {
    const conversionFactor =
      TIME_UNITS_IN_SECONDS[this.functionalUnitTime.unit];

    if (!conversionFactor) {
      throw new InputValidationError(
        this.errorBuilder({
          message: 'functional-unit-time is not in recognized unit of time',
        })
      );
    }

    return sciSecs * conversionFactor;
  }

  /**
   * Calculates sci in seconds for a given input.
   */
  private calculateSciSeconds(input: ModelParams): number {
    const operational = parseFloat(input['operational-carbon']);
    const embodied = parseFloat(input['embodied-carbon']);
    const sciSecs = (operational + embodied) / input['duration'];

    return 'carbon' in input ? input['carbon'] / input['duration'] : sciSecs;
  }

  /**
   * Checks for fields in input.
   */
  private validateInput(input: ModelParams): ModelParams {
    const unitWarnMessage =
      'Please ensure you have provided one value and one unit and they are either space, underscore or hyphen separated.';
    const message =
      'functional-unit-time, either carbon or both of operational-carbon and embodied-carbon should be present.';

    const schemaWithCarbon = z.object({
      'functional-unit-time': z
        .string()
        .regex(new RegExp('^[0-9][ _-][a-zA-Z]+$'))
        .min(3, unitWarnMessage),
      carbon: z.number().gte(0),
    });

    const schemaWithoutCarbon = z.object({
      'functional-unit-time': z
        .string()
        .regex(new RegExp('^[0-9][ _-][a-zA-Z]+$'))
        .min(3, unitWarnMessage),
      'operational-carbon': z.number().gte(0),
      'embodied-carbon': z.number().gte(0),
    });

    const schema = schemaWithCarbon
      .or(schemaWithoutCarbon)
      .refine(allDefined, {message});

    return validate(schema, input);
  }

  /**
   * Parses the 'functional-unit-time' from the input and extracts the time value and unit.
   * Updates the functionalUnitTime's unit and value properties accordingly.
   */
  private parseTime(input: ModelParams) {
    const splits = input['functional-unit-time'].split(/[-_ ]/);

    this.functionalUnitTime.unit = splits[1];
    this.functionalUnitTime.value = parseFloat(splits[0]);
  }
}
