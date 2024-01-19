import * as fs from 'fs';
import * as path from 'path';

import {z} from 'zod';

import {ModelPluginInterface} from '../../interfaces';
import {KeyValuePair, ModelParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';

const {UnsupportedValueError, ReadFileError} = ERRORS;

export class TdpFinderModel implements ModelPluginInterface {
  data: any;
  errorBuilder = buildErrorMessage(this.constructor);

  /**
   * Configures the TDP Finder Plugin.
   */
  public async configure(): Promise<ModelPluginInterface> {
    this.data = await this.loadData();

    return this;
  }

  /**
   * Calculate the total emissions for a list of inputs.
   */
  public async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    return Promise.all(
      inputs.map((input, index: number) => {
        Object.assign(input, this.validateInput(input));

        input['thermal-design-power'] = 0;

        const physicalProcessors = input['physical-processor'] as string;
        const processors = physicalProcessors
          .split(',')
          .map(processor => processor.trim());

        for (const processor of processors) {
          if (processor in this.data) {
            const currentTDP = input['thermal-design-power'];
            input['thermal-design-power'] = Math.max(
              currentTDP,
              this.data[processor]
            );
          } else {
            throw new UnsupportedValueError(
              this.errorBuilder({
                message: `'physical-processor': ${processor} from input[${index}] is not found in the database`,
              })
            );
          }
        }

        return input;
      })
    );
  }

  /**
   * Load data from csv files.
   */
  private async loadData(): Promise<KeyValuePair> {
    const data: KeyValuePair = {};

    const processFile = async (filePath: string) => {
      const lines = await this.readFile(filePath);
      for (const line of lines) {
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
    };

    await processFile('data.csv');
    await processFile('data2.csv');
    await processFile('boavizta_data.csv');

    return data;
  }

  /**
   * Read the file with provided filePath.
   */
  private async readFile(filePath: string): Promise<string[]> {
    try {
      const result = await fs.promises.readFile(
        path.join(__dirname, filePath),
        'utf8'
      );
      return result.split('\n');
    } catch (error) {
      throw new ReadFileError(`Error reading file ${filePath}: ${error}`);
    }
  }

  /**
   * Checks for required fields in input.
   */
  private validateInput(input: ModelParams): ModelParams {
    const schema = z
      .object({
        'physical-processor': z.string(),
      })
      .refine(allDefined, {
        message: '`physical-processor` should be present.',
      });

    return validate(schema, input);
  }
}
