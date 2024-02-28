import {z} from 'zod';

import {PluginInterface} from '../../interfaces';
import {PluginParams} from '../../types/common';

import {validate, allDefined} from '../../util/validations';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';

import {InstanceInput} from './types';

import * as AWS_INSTANCES from './aws-instances.json';
import * as AZURE_INSTANCES from './azure-instances.json';

const {UnsupportedValueError} = ERRORS;

export const CloudInstanceMetadata = (): PluginInterface => {
  const SUPPORTED_CLOUDS = ['aws', 'azure'] as const;
  const errorBuilder = buildErrorMessage(CloudInstanceMetadata.name);
  const metadata = {
    kind: 'execute',
  };

  /**
   * Get provided cloud data into input.
   */
  const execute = async (inputs: PluginParams[]) => {
    return inputs.map(input => {
      const safeInput = Object.assign({}, input, validateInput(input));
      const instanceType = safeInput['cloud/instance-type'];
      const vendor = safeInput['cloud/vendor'];

      const instance: InstanceInput | undefined = getVendorInstance(
        vendor,
        instanceType
      );

      // Process instance metadata based on cloud vendor
      if (instance) {
        safeInput['vcpus-allocated'] = parseInt(instance['cpu-cores-utilized']);
        safeInput['vcpus-total'] = parseInt(instance['cpu-cores-available']);
        safeInput['memory-available'] = parseInt(instance['memory-available']);
        safeInput['physical-processor'] = instance['cpu-model-name'];
        safeInput['cpu/thermal-design-power'] = parseFloat(instance['cpu-tdp']);
      } else {
        throw new UnsupportedValueError(
          errorBuilder({
            scope: 'cloud/instance-type',
            message: `'${instanceType}' is not supported in '${vendor}'`,
          })
        );
      }
      return safeInput;
    });
  };

  /**
   * Execute the function associated with the specified vendor type and get the instance.
   */
  const getVendorInstance = (vendor: string, instanceType: string) => {
    const vendorType: Record<string, () => InstanceInput | undefined> = {
      aws: () => {
        return AWS_INSTANCES.find(
          instance => instance['instance-class'] === instanceType
        );
      },
      azure: () => {
        if (instanceType.includes('-')) {
          const [instanceFamily, instanceSize] = instanceType.split('-');
          const sizeNumberIndex = instanceSize.search(/\D/);
          const instanceSizeNumber =
            sizeNumberIndex !== -1
              ? instanceSize.slice(sizeNumberIndex)
              : instanceSize;

          instanceType = `${instanceFamily}${instanceSizeNumber}`;
        }

        return AZURE_INSTANCES.find(
          instance => instance['instance-class'] === instanceType
        );
      },
    };

    return vendorType[vendor]();
  };

  /**
   * Checks for required fields in input.
   */
  const validateInput = (input: PluginParams) => {
    const schema = z
      .object({
        'cloud/vendor': z.enum(SUPPORTED_CLOUDS, {
          required_error: `Only ${SUPPORTED_CLOUDS} is currently supported`,
        }),
        'cloud/instance-type': z.string(),
      })
      .refine(allDefined, {
        message: 'All cloud/vendor and cloud/instance-type should be present.',
      });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  return {
    metadata,
    execute,
  };
};
