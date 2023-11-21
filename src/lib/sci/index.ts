import { ModelPluginInterface } from '../../interfaces';

import { KeyValuePair } from '../../types/common';

export class SciModel implements ModelPluginInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  functionalUnit = 'none';
  functionalUnitTimeValue = 1;
  functionalUnitTimeUnit = '';
  factor = 1;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  async execute(inputs: object | object[] | undefined): Promise<any[]> {
    if (!Array.isArray(inputs)) {
      throw new Error('inputs should be an array');
    }

    // get value and unit for functional unit of time

    this.parseTime(inputs);

    const tunedinputs = inputs.map((input: KeyValuePair) => {
      if (!('operational-carbon' in input)) {
        throw new Error('input missing `operational-carbon`');
      }
      if (!('embodied-carbon' in input)) {
        throw new Error('input missing `embodied-carbon`');
      }

      const operational = parseFloat(input['operational-carbon']);
      const embodied = parseFloat(input['embodied-carbon']);

      /*
      If `carbon` is in inputs, use it.
      If not, calculate it from operational and embodied carbon.
      Divide by input[duration] to ensure time unit is /s
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
      Convert C to desired time unit
      */
      if (seconds.includes(this.functionalUnitTimeUnit)) {
        sci_timed = sci_secs;
      }
      else if (minutes.includes(this.functionalUnitTimeUnit)) {
        sci_timed = sci_secs * 60;
      }
      else if (hours.includes(this.functionalUnitTimeUnit)) {
        sci_timed = sci_secs * 60 * 60;
      }
      else if (days.includes(this.functionalUnitTimeUnit)) {
        sci_timed = sci_secs * 60 * 60 * 24;
      }
      else if (weeks.includes(this.functionalUnitTimeUnit)) {
        sci_timed = sci_secs * 60 * 60 * 24 * 7;
      }
      else if (months.includes(this.functionalUnitTimeUnit)) {
        if (this.functionalUnitTimeUnit == 'm') {
          console.warn("you are using `m` as your time unit. This is interpreted as months. If you meant minutes, please use `min` instead.")
        }
        sci_timed = sci_secs * 60 * 60 * 24 * 7 * 4;
      }
      else if (years.includes(this.functionalUnitTimeUnit)) {
        sci_timed = sci_secs * 60 * 60 * 24 * 365;
      }
      else {
        throw new Error("functional-unit-time is not in recognized unit of time")
      }

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
      sci currently in whole single units of time - multiply by duration to
      convert to user-defined span of time.
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
    if (staticParams === undefined) {
      throw new Error('Required Parameters not provided');
    }
    return this;
  }

  private parseTime(inputs: object) {
    if (!Array.isArray(inputs)) {
      throw new Error('inputs should be an array');
    }
    if (
      'functional-unit-time' in inputs[0] &&
      typeof inputs[0]['functional-unit-time'] === 'string'
    ) {
      const timeString = inputs[0]['functional-unit-time'];
      const splits = timeString.split(' ');
      const timeValue = parseFloat(splits[0]);
      console.log(typeof (timeValue), timeValue)
      if (typeof (timeValue) !== 'number' || timeValue <= 0 || isNaN(timeValue)) {
        throw new Error("functional-unit-time is not a positive number")
      }
      const timeUnit = splits[1];
      this.functionalUnitTimeUnit = timeUnit;
      this.functionalUnitTimeValue = timeValue;
    } else {
      throw new Error('functional-unit-time is not available');
    }
  }
}
