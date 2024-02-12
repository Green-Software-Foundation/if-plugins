import {z} from 'zod';

import {PluginParams} from '../../types/common';
import {validate, allDefined} from '../../util/validations';

import {ERRORS} from '../../util/errors';

import {TIME_UNITS_IN_SECONDS} from './config';
import {buildErrorMessage} from '../../util/helpers';

const {InputValidationError} = ERRORS;

export const Sci = () => {
  const errorBuilder = buildErrorMessage(Sci.name);
  const metadata = {
    kind: 'execute',
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = async (inputs: PluginParams[]): Promise<any[]> => {
    return inputs.map(input => {
      const safeInput = Object.assign({}, input, validateInput(input));
      return tuneInput(safeInput);
    });
  };

  /**
   * Given an input, tunes it and returns the tuned input.
   */
  const tuneInput = (input: PluginParams) => {
    const functionalUnitTime = parseTime(input);
    const sciPerSecond = calculateSciSeconds(input);
    const sciTimed = convertSciToTimeUnit(sciPerSecond, functionalUnitTime);
    const factor = getFunctionalUnitConversionFactor(input);
    const sciTimedDuration = sciTimed * functionalUnitTime.value;

    return {
      ...input,
      carbon: input['carbon'] ?? sciPerSecond,
      sci: sciTimedDuration / factor,
    };
  };

  /**
   * Gets the conversion factor based on the functional unit specified in the input.
   * If the 'functional-unit' exists in the input and is not 'none' or an empty string,
   * returns the value; otherwise, defaults to 1.
   */
  const getFunctionalUnitConversionFactor = (input: PluginParams): number => {
    const functionalUnit = input['functional-unit'];

    return functionalUnit in input &&
      input[functionalUnit] !== 'none' &&
      input[functionalUnit] !== ''
      ? input[functionalUnit]
      : 1;
  };

  /**
   * Converts the given sci value from seconds to the specified time unit.
   */
  const convertSciToTimeUnit = (
    sciPerSecond: number,
    functionalUnitTime: {unit: string; value: number}
  ): number => {
    const conversionFactor = TIME_UNITS_IN_SECONDS[functionalUnitTime.unit];

    if (!conversionFactor) {
      throw new InputValidationError(
        errorBuilder({
          message: 'functional-unit-time is not in recognized unit of time',
        })
      );
    }

    return sciPerSecond * conversionFactor;
  };

  /**
   * Calculates sci in seconds for a given input.
   */
  const calculateSciSeconds = (input: PluginParams): number => {
    const operational = parseFloat(input['operational-carbon']);
    const embodied = parseFloat(input['embodied-carbon']);
    const sciPerSecond = (operational + embodied) / input['duration'];

    return 'carbon' in input
      ? input['carbon'] / input['duration']
      : sciPerSecond;
  };

  /**
   * Checks for fields in input.
   */
  const validateInput = (input: PluginParams) => {
    const unitWarnMessage =
      'Please ensure you have provided one value and one unit and they are either space, underscore, or hyphen separated.';
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

    return validate<z.infer<typeof schema>>(schema, input);
  };

  /**
   * Parses the 'functional-unit-time' from the input and extracts the time value and unit.
   * Updates the functionalUnitTime's unit and value properties accordingly.
   */
  const parseTime = (input: PluginParams) => {
    const splits = input['functional-unit-time'].split(/[-_ ]/);
    return {
      unit: splits[1],
      value: parseFloat(splits[0]),
    };
  };

  return {
    metadata,
    execute,
  };
};
