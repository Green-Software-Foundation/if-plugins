import * as fs from 'fs';
import * as path from 'path';

import {z} from 'zod';

import {ModelPluginInterface} from '../../interfaces';
import {ModelParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';

const {UnsupportedValueError, ReadFileError} = ERRORS;

export class TdpFinderModel implements ModelPluginInterface {
  data: any;
  errorBuilder = buildErrorMessage(this.constructor.name);

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
    return inputs.map((input, index: number) => {
      const safeInput = Object.assign(input, this.validateInput(input));
      const processors = safeInput['physical-processor']
        .split(',')
        .map(processor => processor.trim());

      for (const processor of processors) {
        if (!(processor in this.data)) {
          throw new UnsupportedValueError(
            this.errorBuilder({
              message: `'physical-processor': ${processor} from input[${index}] is not found in the database`,
            })
          );
        }

        safeInput['thermal-design-power'] = Math.max(
          safeInput['thermal-design-power'] ?? 0,
          this.data[processor]
        );
      }

      return safeInput;
    });
  }

  /**
   * Load data from csv files.
   */
  private async loadData() {
    const files = ['data.csv', 'data2.csv', 'boavizta-data.csv'];

    const combinedData = await files.reduce(
      async (accPromise, filePath) => {
        const acc = await accPromise;
        const lines = await this.readFile(filePath);

        return lines.reduce((dataAcc, line) => {
          const [name_w_at, tdp_r] = line.split(',');

          if (name_w_at === '') {
            return dataAcc; // Skip processing empty lines
          }

          const name = name_w_at.split('@')[0].trim();
          const tdp = parseFloat(tdp_r.replace('\r', ''));

          if (!(name in dataAcc) || dataAcc[name] < tdp) {
            dataAcc[name] = tdp;
          }

          return dataAcc;
        }, acc);
      },
      Promise.resolve({} as {[name: string]: number})
    );

    return combinedData;
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
  private validateInput(input: ModelParams) {
    const schema = z
      .object({
        'physical-processor': z.string(),
      })
      .refine(allDefined, {
        message: '`physical-processor` should be present.',
      });

    return validate<z.infer<typeof schema>>(schema, input);
  }
}
