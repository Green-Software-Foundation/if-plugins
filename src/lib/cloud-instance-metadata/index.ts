import {ModelPluginInterface} from '../../interfaces';

import {ERRORS} from '../../util/errors';

import * as AWS_INSTANCES from './aws-instances.json';
import * as AZURE_INSTANCES from './azure-instances.json';

import {KeyValuePair, ModelParams} from '../../types/common';
import {buildErrorMessage} from '../../util/helpers';

const {InputValidationError} = ERRORS;

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
        throw new InputValidationError(
          this.errorBuilder({
            scope: 'cloud-vendor',
            message: "Only 'aws'/'azure' is currently supported",
          })
        );
      }

      if (vendor === 'aws') {
        const instance = AWS_INSTANCES.find(
          instance => instance['Instance type'] === instance_type
        );

        if (instance) {
          input['vcpus-allocated'] = instance['Instance vCPU'];
          input['vcpus-total'] = instance['Platform Total Number of vCPU'];
          input['memory-available'] = instance['Instance Memory (in GB)'];
          const cpuType = instance['Platform CPU Name'];

          let platform = '';

          if (cpuType.startsWith('EPYC')) {
            platform = 'AMD';
          } else if (cpuType.startsWith('Xeon')) {
            platform = 'Intel';
          } else if (cpuType.startsWith('Graviton')) {
            platform = 'AWS';
          } else if (cpuType.startsWith('Core')) {
            platform = 'Intel';
          }
          input['physical-processor'] = `${platform} ${cpuType}`;
        } else {
          throw new InputValidationError(
            this.errorBuilder({
              scope: 'cloud-instance-type',
              message: `'${instance_type}' is not supported in '${vendor}'`,
            })
          );
        }
      } else if (vendor === 'azure') {
        const instance = AZURE_INSTANCES.find(
          instance => instance['instance-type'] === instance_type
        );

        if (instance) {
          input['vcpus-allocated'] = instance['cpu-cores-utilized'];
          input['vcpus-total'] = instance['cpu-cores-available'];
          input['physical-processor'] = instance['cpu-model-name'];
          input['memory-available'] = instance['memory-available'];
          input['thermal-design-power'] = instance['thermal-design-power'];
        } else {
          throw new InputValidationError(
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
