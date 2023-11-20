import { ModelPluginInterface } from '../../interfaces';

import { KeyValuePair } from '../../types/common';

export class SciModel implements ModelPluginInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  functionalUnit: string = 'none';
  functionalUnitTimeValue: number = 1;
  functionalUnitTimeUnit: string = '';
  factor: number = 1;

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

      /*
      Convert C to desired time unit
      */
      if (
        this.functionalUnitTimeUnit === 's' ||
        this.functionalUnitTimeUnit === 'second' ||
        this.functionalUnitTimeUnit === 'seconds' ||
        this.functionalUnitTimeUnit === 'secs' ||
        this.functionalUnitTimeUnit === '' ||
        this.functionalUnitTimeUnit === null ||
        this.functionalUnitTimeUnit === 'none'
      ) {
        sci_timed = sci_secs;
      }
      if (
        this.functionalUnitTimeUnit === 'minute' ||
        this.functionalUnitTimeUnit === 'minutes' ||
        this.functionalUnitTimeUnit === 'mins' ||
        this.functionalUnitTimeUnit === "min" ||
        this.functionalUnitTimeUnit === 'm'
      ) {
        console.log("IN HERE MINS")
        sci_timed = sci_secs * 60;
      }
      if (
        this.functionalUnitTimeUnit === 'hour' ||
        this.functionalUnitTimeUnit === 'hours' ||
        this.functionalUnitTimeUnit === 'hr' ||
        this.functionalUnitTimeUnit === 'h'
      ) {
        sci_timed = sci_secs * 60 * 60;
      }
      if (this.functionalUnitTimeUnit === 'day' || this.functionalUnitTimeUnit === 'days' || this.functionalUnitTimeUnit === 'd') {
        console.log("IN HERE DAYS")
        sci_timed = sci_secs * 60 * 60 * 24;
      }
      if (this.functionalUnitTimeUnit === 'week' || this.functionalUnitTimeUnit === 'weeks' || this.functionalUnitTimeUnit === 'w') {
        sci_timed = sci_secs * 60 * 60 * 24 * 7;
      }
      if (this.functionalUnitTimeUnit === 'month' || this.functionalUnitTimeUnit === 'months') {
        sci_timed = sci_secs * 60 * 60 * 24 * 7 * 4;
      }
      if (
        this.functionalUnitTimeUnit === 'year' ||
        this.functionalUnitTimeUnit === 'years' ||
        this.functionalUnitTimeUnit === 'yr' ||
        this.functionalUnitTimeUnit === 'y'
      ) {
        sci_timed = sci_secs * 60 * 60 * 24 * 365;
      }


      var factor = 1; // default functional unit is 1 - i.e. do not change current value
      this.functionalUnit = input['functional-unit'];
      console.log(this.functionalUnit)
      if (this.functionalUnit in input && input[this.functionalUnit] !== 'none' && input[this.functionalUnit] !== '') {
        factor = input[this.functionalUnit];
      }
      console.log("factor", factor)
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
    return this
  }


  private parseTime(inputs: object) {
    if (!Array.isArray(inputs)) {
      throw new Error('inputs should be an array');
    }
    if ('functional-unit-time' in inputs[0] && typeof inputs[0]['functional-unit-time'] === 'string') {
      const timeString = inputs[0]['functional-unit-time'];
      const splits = timeString.split(" ");
      const timeValue = parseFloat(splits[0])
      const timeUnit = splits[1];
      this.functionalUnitTimeUnit = timeUnit;
      this.functionalUnitTimeValue = timeValue;

    } else {
      throw new Error("functional-unit-time is not available")
    }
  }
}
