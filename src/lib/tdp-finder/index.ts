import * as fs from 'fs';
import * as path from 'path';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';

import {ModelPluginInterface} from '../../interfaces';
import {KeyValuePair} from '../../types/common';

const {InputValidationError, UnsupportedValueError} = ERRORS;

export class TdpFinderModel implements ModelPluginInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  data: any;
  errorBuilder = buildErrorMessage(TdpFinderModel);

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   * Calculate the total emissions for a list of inputs.
   *
   * Each Input require:
   * @param {Object[]} inputs
   * @param {string} inputs[].timestamp RFC3339 timestamp string
   */
  async execute(inputs: object | object[] | undefined): Promise<any[]> {
    if (inputs === undefined) {
      throw new InputValidationError(
        this.errorBuilder({message: 'Input data is missing'})
      );
    }

    if (!Array.isArray(inputs)) {
      throw new InputValidationError(
        this.errorBuilder({message: 'Input data is not an array'})
      );
    }

    return inputs.map((input: KeyValuePair, index: number) => {
      input['thermal-design-power'] = 0;
      if ('physical-processor' in input) {
        const physicalProcessors = input['physical-processor'] as string;
        physicalProcessors.split(',').forEach(physicalProcessor => {
          physicalProcessor = physicalProcessor.trim();
          if (
            physicalProcessor in this.data &&
            input['thermal-design-power'] < this.data[physicalProcessor]
          ) {
            input['thermal-design-power'] = this.data[physicalProcessor];
          } else if (!(physicalProcessor in this.data)) {
            throw new UnsupportedValueError(
              this.errorBuilder({
                message: `'physical-processor': ${physicalProcessor} from input[${index}] is not found in database. Please check spelling / contribute to 'if-models' with the data.`,
              })
            );
          }
        });
      } else {
        throw new InputValidationError(
          this.errorBuilder({
            message: `'physical-processor' not provided in input[${index}].`,
          })
        );
      }
      return input;
    });
  }

  async configure(
    staticParams: object | undefined
  ): Promise<ModelPluginInterface> {
    this.staticParams = staticParams;
    this.data = await this.loadData();

    return this;
  }

  async loadData(): Promise<any> {
    const data: KeyValuePair = {};
    // read data.csv and read lines into memory
    const result = fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8');
    for (const line of result.split('\n')) {
      const [name_w_at, tdp_r] = line.split(',');
      const name = name_w_at.split('@')[0].trim();
      const tdp = parseFloat(tdp_r.replace('\r', ''));
      data[name] = tdp;
    }

    const result2 = fs.readFileSync(path.join(__dirname, 'data2.csv'), 'utf8');
    for (const line of result2.split('\n')) {
      const [name_w_at, tdp_r] = line.split(',');

      if (name_w_at === '') {
        continue;
      }

      const name = name_w_at.split('@')[0].trim();
      const tdp = parseFloat(tdp_r.replace('\r', ''));

      if (!(name in data) || data[name] < tdp) {
        data[name] = tdp;
      }
    }

    const result3 = fs.readFileSync(
      path.join(__dirname, 'boavizta_data.csv'),
      'utf8'
    );
    for (const line of result3.split('\n')) {
      const [name_w_at, tdp_r] = line.split(',');

      if (name_w_at === '') {
        continue;
      }

      const name = name_w_at.split('@')[0].trim();
      const tdp = parseFloat(tdp_r.replace('\r', ''));

      if (!(name in data) || data[name] < tdp) {
        data[name] = tdp;
      }
    }

    return data;
  }
}
