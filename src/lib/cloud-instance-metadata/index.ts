import {ModelPluginInterface} from '../../interfaces';

import {ERRORS} from '../../util/errors';

import * as AWS_INSTANCES from './aws-instances.json';
import * as AZURE_INSTANCES from './azure-instances.json';

import {KeyValuePair, ModelParams} from '../../types/common';
import {buildErrorMessage} from '../../util/helpers';

const {InputValidationError, UnsupportedValueError} = ERRORS;

export class CloudInstanceMetadataModel implements ModelPluginInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  errorBuilder = buildErrorMessage(CloudInstanceMetadataModel);

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   * Each input require:
   * @param {Object[]} inputs
   * @param {string} inputs[].timestamp RFC3339 timestamp string
   */
  async execute(inputs: ModelParams[]): Promise<any[]> {
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

    return inputs.map((input: KeyValuePair) => {
      let vendor = '';
      let instance_type = '';

      if (!('cloud-vendor' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: "Each input must contain a 'cloud-vendor' key",
          })
        );
      }

      vendor = input['cloud-vendor'];

      if ('cloud-instance-type' in input) {
        instance_type = input['cloud-instance-type'];
      } else {
        throw new InputValidationError(
          this.errorBuilder({
            message: "Each input must contain a 'cloud-instance-type' key",
          })
        );
      }

      const clouds = ['aws', 'azure'];

      if (!clouds.includes(vendor)) {
        throw new UnsupportedValueError(
          this.errorBuilder({
            scope: 'cloud-vendor',
            message: "Only 'aws'/'azure' is currently supported",
          })
        );
      }

      if (vendor === 'aws') {
        const instance = AWS_INSTANCES.find(
          instance => instance['instance-class'] === instance_type
        );

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
              message: `'${instance_type}' is not supported in '${vendor}'`,
            })
          );
        }
      } else if (vendor === 'azure') {
        if (instance_type.includes('-')) {
          const instance_family = instance_type.split('-')[0];
          const instance_size = instance_type.split('-')[1];
          let i = 0;
          // for each letter in instance size check if it is a number
          for (i = 0; i < instance_size.length; i++) {
            if (isNaN(Number(instance_size[i]))) {
              break;
            }
          }
          const instance_size_number = instance_size.slice(i);
          instance_type = `${instance_family}${instance_size_number}`;
        }
        const instance = AZURE_INSTANCES.find(
          instance => instance['instance-class'] === instance_type
        );

        if (instance) {
          input['vcpus-allocated'] = parseInt(instance['cpu-cores-utilized']);
          input['vcpus-total'] = parseInt(instance['cpu-cores-available']);
          input['physical-processor'] = instance['cpu-model-name'];
          input['memory-available'] = parseInt(instance['memory-available']);
          input['thermal-design-power'] = parseFloat(instance['cpu-tdp']);
        } else {
          throw new UnsupportedValueError(
            this.errorBuilder({
              scope: 'cloud-instance-type',
              message: `'${instance_type}' is not supported in '${vendor}'`,
            })
          );
        }
      }
      return input;
    });
  }

  async configure(
    staticParams: object | undefined
  ): Promise<ModelPluginInterface> {
    this.staticParams = staticParams;

    return this;
  }
}
