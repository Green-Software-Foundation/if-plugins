import {z} from 'zod';

import {ModelPluginInterface} from '../../interfaces';
import {ModelParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';

const {InputValidationError} = ERRORS;

export class SciMModel implements ModelPluginInterface {
  errorBuilder = buildErrorMessage(this.constructor.name);
  METRICS = [
    'total-embodied-emissions',
    'expected-lifespan',
    'resources-reserved',
    'vcpus-allocated',
    'total-resources',
    'vcpus-total',
  ];

  /**
   * Configures the SCI-M Plugin.
   */
  public async configure(): Promise<ModelPluginInterface> {
    return this;
  }

  /**
   * Calculate the Embodied carbon for a list of inputs.
   */
  public async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    return inputs.map(input => {
      const safeInput = this.validateInput(input);
      Object.assign(input, safeInput);

      //Total embodied emissions of some underlying hardware.
      const totalEmissions = this.parseNumberInput(
        input['total-embodied-emissions'],
        'gCO2e'
      );

      //The length of time the hardware is reserved for use by the software.
      const duration = this.parseNumberInput(input['duration'], 'seconds');

      //The anticipated time that the equipment will be installed.
      const ExpectedLifespan = this.parseNumberInput(
        input['expected-lifespan'],
        'seconds'
      );

      //The number of resources reserved for use by the software. (e.g. number of vCPUs you are using)
      const resourcesReserved = this.parseNumberInput(
        input['vcpus-allocated'] || input['resources-reserved'],
        'count'
      );

      //The total number of resources available (e.g. total number of vCPUs for underlying hardware)
      const totalResources = this.parseNumberInput(
        input['vcpus-total'] || input['total-resources'],
        'count'
      );

      // M = totalEmissions * (duration/ExpectedLifespan) * (resourcesReserved/totalResources)
      input['embodied-carbon'] =
        totalEmissions *
        (duration / ExpectedLifespan) *
        (resourcesReserved / totalResources);

      return input;
    });
  }

  /**
   * Parses the input value, ensuring it is a valid number, and returns the parsed number.
   * Throws an InputValidationError if the value is not a valid number.
   */
  private parseNumberInput(value: any, unit: string): number {
    const parsedValue = typeof value === 'string' ? parseFloat(value) : value;

    if (typeof parsedValue !== 'number' || isNaN(parsedValue)) {
      throw new InputValidationError(
        this.errorBuilder({
          message: `'${value}' is not a valid number in input. Please provide it as ${unit}.`,
        })
      );
    }

    return parsedValue;
  }

  /**
   * Checks for required fields in input.
   */
  private validateInput(input: ModelParams) {
    const schemaWithVcpus = z.object({
      'total-embodied-emissions': z.number().gte(0).min(0),
      'expected-lifespan': z.number().gte(0).min(0),
      'vcpus-allocated': z.number().gte(0).min(0),
      'vcpus-total': z.number().gte(0).min(0),
    });

    const schemaWithResources = z.object({
      'total-embodied-emissions': z.number().gte(0).min(0),
      'expected-lifespan': z.number().gte(0).min(0),
      'resources-reserved': z.number().gte(0).min(0),
      'total-resources': z.number().gte(0).min(0),
    });

    const schema = schemaWithVcpus.or(schemaWithResources).refine(allDefined, {
      message: `All ${this.METRICS} should be present.`,
    });

    return validate<z.infer<typeof schema>>(schema, input);
  }
}
