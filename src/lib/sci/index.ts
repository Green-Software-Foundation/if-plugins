import {ModelPluginInterface} from '../../interfaces';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';

import {KeyValuePair, ModelParams} from '../../types/common';

const {InputValidationError, UnsupportedValueError} = ERRORS;

export class SciModel implements ModelPluginInterface {
  staticParams: object | undefined;
  name: string | undefined;
  functionalUnit = 'none';
  functionalUnitTimeValue = 1;
  functionalUnitTimeUnit = '';
  factor = 1;
  errorBuilder = buildErrorMessage(SciModel);

  async execute(inputs: ModelParams[]): Promise<any[]> {
    // parseout time value and unit from input string
    this.parseTime(inputs);

    const tunedinputs = inputs.map((input: KeyValuePair) => {
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

      const seconds = ['s', 'second', 'sec', 'secs', 'seconds'];
      const minutes = ['min', 'mins', 'minute', 'minutes'];
      const hours = ['h', 'hs', 'hr', 'hrs', 'hour', 'hours'];
      const days = ['d', 'ds', 'day', 'ds', 'days'];
      const weeks = ['w', 'ws', 'wk', 'wks', 'week', 'weeks'];
      const months = ['m', 'mnth', 'mth', 'mnths', 'mths', 'month', 'months'];
      const years = ['y', 'ys', 'yr', 'yrs', 'year', 'years'];

      /*
       * Convert C to desired time unit
       */
      if (seconds.includes(this.functionalUnitTimeUnit)) {
        // pass
      } else if (minutes.includes(this.functionalUnitTimeUnit)) {
        sci_timed = sci_secs * 60;
      } else if (hours.includes(this.functionalUnitTimeUnit)) {
        sci_timed = sci_secs * 60 * 60;
      } else if (days.includes(this.functionalUnitTimeUnit)) {
        sci_timed = sci_secs * 60 * 60 * 24;
      } else if (weeks.includes(this.functionalUnitTimeUnit)) {
        sci_timed = sci_secs * 60 * 60 * 24 * 7;
      } else if (months.includes(this.functionalUnitTimeUnit)) {
        if (this.functionalUnitTimeUnit === 'm') {
          console.warn(
            'you are using `m` as your time unit. This is interpreted as months. If you meant minutes, please use `min` instead.'
          );
        }
        sci_timed = sci_secs * 60 * 60 * 24 * 7 * 4;
      } else if (years.includes(this.functionalUnitTimeUnit)) {
        sci_timed = sci_secs * 60 * 60 * 24 * 365;
      } else {
        throw new Error(
          'functional-unit-time is not in recognized unit of time'
        );
      }

      // apply any functional unit conversion to time-corrected SCI score
      let factor = 1; // default functional unit is 1 - i.e. do not change current value
      this.functionalUnit = input['functional-unit'];
      if (
        this.functionalUnit in input &&
        input[this.functionalUnit] !== 'none' &&
        input[this.functionalUnit] !== ''
      ) {
        factor = input[this.functionalUnit];
      }

      /*
       * Sci currently in whole single units of time - multiply by duration to convert to user-defined span of time.
       */
      sci_timed_duration = sci_timed * this.functionalUnitTimeValue;
      input['sci'] = sci_timed_duration / factor;

      return input;
    });

    return tunedinputs;
  }

  async configure(
    staticParams: object | undefined
  ): Promise<ModelPluginInterface> {
    this.staticParams = staticParams;
    return this;
  }

  private parseTime(inputs: ModelParams[]) {
    let splits;
    if (
      'functional-unit-time' in inputs[0] &&
      typeof inputs[0]['functional-unit-time'] === 'string'
    ) {
      const timeString = inputs[0]['functional-unit-time'];

      if (timeString.includes('-')) {
        splits = timeString.split('-');
      } else if (timeString.includes('_')) {
        splits = timeString.split('_');
      } else {
        splits = timeString.split(' ');
      }

      if (splits.length !== 2) {
        throw new InputValidationError(
          this.errorBuilder({
            message:
              "Error while parsing 'functional-unit-time'. Please ensure you have provided one value and one unit and they are either space, underscore or hyphen separated",
          })
        );
      }

      const timeValue = parseFloat(splits[0]);

      if (typeof timeValue !== 'number' || timeValue <= 0 || isNaN(timeValue)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: "'functional-unit-time' is not a valid positive number",
          })
        );
      }

      const timeUnit = splits[1];
      this.functionalUnitTimeUnit = timeUnit;
      this.functionalUnitTimeValue = timeValue;
    } else {
      throw new UnsupportedValueError(
        this.errorBuilder({
          message: "'functional-unit-time' is not available",
        })
      );
    }
  }
}
