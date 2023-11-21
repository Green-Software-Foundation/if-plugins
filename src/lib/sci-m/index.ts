import {ModelPluginInterface} from '../../interfaces';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';

import {KeyValuePair} from '../../types/common';

const {InputValidationError} = ERRORS;

export class SciMModel implements ModelPluginInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  errorBuilder = buildErrorMessage(SciMModel.name);

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  async execute(inputs: object | object[] | undefined): Promise<any[]> {
    if (!Array.isArray(inputs)) {
      throw new InputValidationError(
        this.errorBuilder({
          message: 'Input data is missing',
        })
      );
    }

    const tunedinputs = inputs.map((input: KeyValuePair) => {
      // te or total-embodied-emissions: Total embodied emissions of some underlying hardware.
      // tir or time-reserved: The length of time the hardware is reserved for use by the software.
      // el or expected-lifespan: The anticipated time that the equipment will be installed.
      // rr or resources-reserved: The number of resources reserved for use by the software. (e.g. number of vCPUs you are using)
      // tor or total-resources: The total number of resources available (e.g. total number of vCPUs for underlying hardware)
      let te = 0.0;
      let tir = 0.0;
      let el = 0.0;
      let rr = 0.0;
      let tor = 0.0;
      if (!('total-embodied-emissions' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message:
              "'total-embodied-emissions' is missing. Please provide in 'gCO2e'",
          })
        );
      }
      if (!('time-reserved' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: "'time-reserved' is missing. Please provide in seconds",
          })
        );
      }
      if (!('expected-lifespan' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message:
              "'expected-lifespan' is missing. Please provide in seconds",
          })
        );
      }
      if (!('resources-reserved' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message:
              "'resources-reserved' is missing. Please provide as a 'count'",
          })
        );
      }
      if (!('total-resources' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message:
              "'total-resources' is missing. Please provide as a 'count'",
          })
        );
      }
      if (
        'total-embodied-emissions' in input &&
        'time-reserved' in input &&
        'expected-lifespan' in input &&
        'resources-reserved' in input &&
        'total-resources' in input
      ) {
        input['total-embodied-emissions'] =
          input['total-embodied-emissions'] ??
          input['total-embodied-emissions'];
        input['time-reserved'] =
          input['time-reserved'] ?? input['time-reserved'];
        input['expected-lifespan'] =
          input['expected-lifespan'] ?? input['expected-lifespan'];
        input['resources-reserved'] =
          input['resources-reserved'] ?? input['resources-reserved'];
        input['total-resources'] =
          input['total-resources'] ?? input['total-resources'];
        if (typeof input['total-embodied-emissions'] === 'string') {
          te = parseFloat(input[input['total-embodied-emissions']]);
        } else if (typeof input['total-embodied-emissions'] === 'number') {
          te = input['total-embodied-emissions'];
        } else {
          te = parseFloat(input['total-embodied-emissions']);
        }
        if (typeof input['time-reserved'] === 'string') {
          tir = parseFloat(input[input['time-reserved']]);
        } else if (typeof input['time-reserved'] === 'number') {
          tir = input['time-reserved'];
        } else {
          tir = parseFloat(input['time-reserved']);
        }
        if (typeof input['expected-lifespan'] === 'string') {
          el = parseFloat(input[input['expected-lifespan']]);
        } else if (typeof input['expected-lifespan'] === 'number') {
          el = input['expected-lifespan'];
        } else {
          el = parseFloat(input['expected-lifespan']);
        }
        if (typeof input['resources-reserved'] === 'string') {
          rr = parseFloat(input[input['resources-reserved']]);
        } else if (typeof input['resources-reserved'] === 'number') {
          rr = input['resources-reserved'];
        } else {
          rr = parseFloat(input['resources-reserved']);
        }
        if (typeof input['total-resources'] === 'string') {
          tor = parseFloat(input[input['total-resources']]);
        } else if (typeof input['total-resources'] === 'number') {
          tor = input['total-resources'];
        } else {
          tor = parseFloat(input['total-resources']);
        }
        // M = TE * (TiR/EL) * (RR/ToR)
        input['embodied-carbon'] = te * (tir / el) * (rr / tor);
      }
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
}
