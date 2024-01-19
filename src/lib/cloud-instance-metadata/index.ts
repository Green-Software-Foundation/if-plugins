import {z} from 'zod';

import {ModelPluginInterface} from '../../interfaces';
import {ModelParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';

import {InstanceInput} from './types';

import * as AWS_INSTANCES from './aws-instances.json';
import * as AZURE_INSTANCES from './azure-instances.json';

const {UnsupportedValueError} = ERRORS;

export class CloudInstanceMetadataModel implements ModelPluginInterface {
  SUPPORTED_CLOUDS = ['aws', 'azure'] as const;
  errorBuilder = buildErrorMessage(this.constructor);

  /**
   * Configures the Cloud Instance Metadata Plugin.
   */
  public async configure(): Promise<ModelPluginInterface> {
    return this;
  }

  /**
   * Get provided cloud data into input.
   */
  public async execute(inputs: ModelParams[]): Promise<any[]> {
    return inputs.map(input => {
      Object.assign(input, this.validateInput(input));

      const instanceType = input['cloud-instance-type'];
      const vendor = input['cloud-vendor'];

      const instance: InstanceInput | undefined = this.getVendorInstance(
        vendor,
        instanceType
      );

      // Process instance metadata based on cloud vendor
      if (instance) {
        input['vcpus-allocated'] = parseInt(instance['cpu-cores-utilized']);
        input['vcpus-total'] = parseInt(instance['cpu-cores-available']);
        input['memory-available'] = parseInt(instance['memory-available']);
        input['physical-processor'] = instance['cpu-model-name'];
        input['thermal-design-power'] = parseFloat(instance['cpu-tdp']);
      } else {
        throw new UnsupportedValueError(
          this.errorBuilder({
            scope: 'cloud-instance-type',
            message: `'${instanceType}' is not supported in '${vendor}'`,
          })
        );
      }
      return input;
    });
  }

  /**
   * Execute the function associated with the specified vendor type and get the instance.
   */
  private getVendorInstance(vendor: string, instanceType: string) {
    const vendorType: Record<string, () => InstanceInput | undefined> = {
      aws: () => {
        return AWS_INSTANCES.find(
          instance => instance['instance-class'] === instanceType
        );
      },
      azure: () => {
        if (instanceType.includes('-')) {
          const instanceFamily = instanceType.split('-')[0];
          const instanceSize = instanceType.split('-')[1];
          let i = 0;
          // for each letter in instance size check if it is a number
          for (i = 0; i < instanceSize.length; i++) {
            if (isNaN(Number(instanceSize[i]))) {
              break;
            }
          }
          const instanceSizeNumber = instanceSize.slice(i);
          instanceType = `${instanceFamily}${instanceSizeNumber}`;
        }

        return AZURE_INSTANCES.find(
          instance => instance['instance-class'] === instanceType
        );
      },
    };

    return vendorType[vendor]();
  }

  /**
   * Checks for required fields in input.
   */
  private validateInput(input: ModelParams): ModelParams {
    const schema = z
      .object({
        'cloud-vendor': z.enum(this.SUPPORTED_CLOUDS, {
          required_error: `Only ${this.SUPPORTED_CLOUDS} is currently supported`,
        }),
        'cloud-instance-type': z.string(),
      })
      .refine(allDefined, {
        message: 'All cloud-vendor and cloud-instance-type should be present.',
      });

    return validate(schema, input);
  }
}
