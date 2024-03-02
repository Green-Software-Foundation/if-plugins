import * as fs from 'fs';
import * as path from 'path';

import {z} from 'zod';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';

const {UnsupportedValueError, ReadFileError} = ERRORS;

export const TdpFinder = (): PluginInterface => {
  const errorBuilder = buildErrorMessage(TdpFinder.name);
  const metadata = {
    kind: 'execute',
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = async (inputs: PluginParams[]) => {
    const data = await loadData();

    return inputs.map((input, index: number) => {
      const safeInput = Object.assign({}, input, validateInput(input));
      const processors = safeInput['physical-processor']
        .split(',')
        .map(processor => processor.trim());

      for (const processor of processors) {
        if (!(processor in data)) {
          throw new UnsupportedValueError(
            errorBuilder({
              message: `'physical-processor': ${processor} from input[${index}] is not found in the database`,
            })
          );
        }

        safeInput['cpu/thermal-design-power'] = Math.max(
          safeInput['cpu/thermal-design-power'] ?? 0,
          data[processor]
        );
      }

      return safeInput;
    });
  };

  /**
   * Load data from csv files.
   */
  const loadData = async () => {
    const files = ['data.csv', 'data2.csv', 'boavizta-data.csv'];

    const combinedData = await files.reduce(
      async (accPromise, filePath) => {
        const acc = await accPromise;
        const lines = await readFile(filePath);

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
  };

  /**
   * Read the file with provided filePath.
   */
  const readFile = async (filePath: string): Promise<string[]> => {
    try {
      const result = await fs.promises.readFile(
        path.join(__dirname, filePath),
        'utf8'
      );
      return result.split('\n');
    } catch (error) {
      throw new ReadFileError(`Error reading file ${filePath}: ${error}`);
    }
  };

  /**
   * Checks for required fields in input.
   */
  const validateInput = (input: PluginParams) => {
    const schema = z
      .object({
        'physical-processor': z.string(),
      })
      .refine(allDefined, {
        message: '`physical-processor` should be present.',
      });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  return {
    metadata,
    execute,
  };
};
