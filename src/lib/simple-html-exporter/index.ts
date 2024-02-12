import {ModelPluginInterface} from '../../interfaces';
import {ModelParams} from '../../types/common';
import {TimeSeriesDataExtractor} from './helpers/TimeSeriesDataExtractor';
import {ERRORS} from '../../util/errors';
const {InputValidationError} = ERRORS;
import {buildErrorMessage} from '../../util/helpers';
import * as fs from 'fs';
import path = require('path');

export class SimpleHtmlExporter implements ModelPluginInterface {
  private static INPUT_HTML_NAME: string = 'html-export-template.html';
  private outputHtmlPath: string = '';
  errorBuilder = buildErrorMessage('SimpleHtmlExporter');

  async configure(
    staticParams: object | undefined = undefined
  ): Promise<ModelPluginInterface> {
    if (staticParams === undefined) {
      throw new InputValidationError(
        this.errorBuilder({message: 'Input data is missing'})
      );
    }
    if ('html-path' in staticParams) {
      const htmlPath = staticParams['html-path'] as string;
      if (htmlPath !== undefined) {
        this.outputHtmlPath = htmlPath;
      }
    } else {
      throw new InputValidationError(
        this.errorBuilder({message: 'Output HTML is missing'})
      );
    }
    return this;
  }

  async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    const [timestamps, energyValues, carbonValues] =
      new TimeSeriesDataExtractor().extract(inputs);

    const directoryPath = __dirname;
    const templateHtmlPath = path.join(
      directoryPath,
      SimpleHtmlExporter.INPUT_HTML_NAME
    );
    const htmlContent = fs.readFileSync(templateHtmlPath, 'utf8');

    const updatedHtmlContent = htmlContent
      .replace(
        /var timestamps = \[.*?\]/s,
        `var timestamps = ${JSON.stringify(timestamps)}`
      )
      .replace(
        /var energyValues = \[.*?\]/s,
        `var energyValues = ${JSON.stringify(energyValues)}`
      )
      .replace(
        /var carbonValues = \[.*?\]/s,
        `var carbonValues = ${JSON.stringify(carbonValues)}`
      );
    fs.writeFileSync(this.outputHtmlPath, updatedHtmlContent, 'utf8');

    return inputs;
  }
}
