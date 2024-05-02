import * as path from 'path';
import * as fs from 'fs/promises';
import {z} from 'zod';

import {PluginInterface} from '../../interfaces';
import {ConfigParams, PluginParams} from '../../types/common';

import {buildErrorMessage} from '../../util/helpers';
import {validate} from '../../util/validations';
import {ERRORS} from '../../util/errors';

const {MakeDirectoryError, WriteFileError, InputValidationError} = ERRORS;

export const GrafanaExport = (): PluginInterface => {
  const metadata = {kind: 'execute'};

  const errorBuilder = buildErrorMessage(GrafanaExport.name);

  const createCsvContent = (
    inputs: PluginParams[],
    headers: string[]
  ): string => {
    return [
      headers.join(','),
      ...inputs.map(row => headers.map(fieldName => row[fieldName]).join(',')),
    ].join('\r\n');
  };

  const execute = async (inputs: PluginParams[], config?: ConfigParams) => {
    const validatedConfig = validateConfig(config);

    const {'output-path': outputPath, headers = []} = validatedConfig;
    const dirPath = path.dirname(outputPath);

    try {
      await fs.mkdir(dirPath, {recursive: true});
    } catch (error) {
      throw new MakeDirectoryError(
        errorBuilder({
          message: `Failed to create directory for CSV at path: ${dirPath} ${error}`,
        })
      );
    }

    const contentHeaders =
      headers &&
      headers.length === 0 &&
      Array.isArray(inputs) &&
      inputs.length > 0
        ? Object.keys(inputs[0])
        : headers;

    const contents = createCsvContent(inputs, contentHeaders);

    try {
      await fs.writeFile(outputPath, contents);
    } catch (error) {
      throw new WriteFileError(
        errorBuilder({
          message: `Failed to write CSV to ${outputPath} ${error}`,
        })
      );
    }

    return inputs;
  };

  const validateConfig = (config?: ConfigParams) => {
    if (!config) {
      throw new InputValidationError(
        errorBuilder({message: 'Configuration data is missing'})
      );
    }

    const schema = z.object({
      'output-path': z.string(),
      headers: z.string().array().optional(),
    });

    return validate<z.infer<typeof schema>>(schema, config);
  };

  return {
    metadata,
    execute,
  };
};
