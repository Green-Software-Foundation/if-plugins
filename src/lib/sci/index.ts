import {ModelPluginInterface} from '../../interfaces';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';

import {KeyValuePair} from '../../types/common';

const {InputValidationError} = ERRORS;

export class SciModel implements ModelPluginInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  errorBuilder = buildErrorMessage(SciModel.name);
  time: string | unknown;
  functionalUnit = 'none';
  functionalUnitDuration = 1;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

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

    const tunedInputs = inputs.map((input: KeyValuePair) => {
      if (!('operational-carbon' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: "Input missing 'operational-carbon'",
          })
        );
      }
      if (!('embodied-carbon' in input)) {
        throw new InputValidationError(
          this.errorBuilder({message: "Input missing 'embodied-carbon'"})
        );
      }

      const operational = parseFloat(input['operational-carbon']);
      const embodied = parseFloat(input['embodied-carbon']);

      /*
       * If `carbon` is in inputs, use it.
       * If not, calculate it from operational and embodied carbon.
       * Divide by input[duration] to ensure time unit is /s
       */
      let sci_secs = 0;
      if ('carbon' in input) {
        sci_secs = input['carbon'] / input['duration'];
      } else {
        sci_secs = (operational + embodied) / input['duration']; // sci in time units of /s
        input['carbon'] = sci_secs;
      }

      let sci_timed: number = sci_secs;
      let sci_timed_duration = sci_secs;

      /*
       * Convert C to desired time unit
       */
      if (
        this.time === 's' ||
        this.time === 'second' ||
        this.time === 'seconds' ||
        this.time === 'secs' ||
        this.time === '' ||
        this.time === null ||
        this.time === 'none'
      ) {
        sci_timed = sci_secs;
      }

      if (
        this.time === 'minute' ||
        this.time === 'minutes' ||
        this.time === 'mins' ||
        this.time === 'm'
      ) {
        sci_timed = sci_secs * 60;
      }

      if (
        this.time === 'hour' ||
        this.time === 'hours' ||
        this.time === 'hr' ||
        this.time === 'h'
      ) {
        sci_timed = sci_secs * 60 * 60;
      }

      if (this.time === 'day' || this.time === 'days' || this.time === 'd') {
        sci_timed = sci_secs * 60 * 60 * 24;
      }

      if (this.time === 'week' || this.time === 'weeks' || this.time === 'd') {
        sci_timed = sci_secs * 60 * 60 * 24 * 7;
      }

      if (this.time === 'month' || this.time === 'months') {
        sci_timed = sci_secs * 60 * 60 * 24 * 7 * 4;
      }

      if (
        this.time === 'year' ||
        this.time === 'years' ||
        this.time === 'yr' ||
        this.time === 'y'
      ) {
        sci_timed = sci_secs * 60 * 60 * 24 * 365;
      }

      /*
       * Sci currently in whole single units of time - multiply by duration to
       * Convert to user-defined span of time.
       */
      sci_timed_duration = sci_timed * this.functionalUnitDuration;

      const functionalUnit = this.functionalUnit;

      if (this.functionalUnit !== 'none') {
        const factor = input[functionalUnit];
        input['sci'] = sci_timed_duration / factor;
        return input;
      } else {
        input['sci'] = sci_timed_duration;
        return input;
      }
    });

    return tunedInputs;
  }

  async configure(
    staticParams: object | undefined
  ): Promise<ModelPluginInterface> {
    if (staticParams === undefined) {
      throw new InputValidationError(
        this.errorBuilder({
          scope: 'configure',
          message: 'Missing input data',
        })
      );
    }

    this.staticParams = staticParams;

    if ('functional-unit-time' in staticParams) {
      this.time = staticParams['functional-unit-time'] as number;
    }
    if (
      'functional-unit-duration' in staticParams &&
      typeof staticParams['functional-unit-duration'] === 'number'
    ) {
      this.functionalUnitDuration = staticParams['functional-unit-duration'];
    } else {
      throw new InputValidationError(
        this.errorBuilder({
          message:
            'Functional unit duration is not a valid number: provide number of seconds represented by input',
        })
      );
    }
    if (
      'functional-unit' in staticParams &&
      typeof staticParams['functional-unit'] === 'string' &&
      staticParams['functional-unit'] !== ''
    ) {
      this.functionalUnit = staticParams['functional-unit'];
    } else {
      this.functionalUnit = 'none';
    }

    return this;
  }
}
