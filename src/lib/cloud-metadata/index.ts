import * as path from 'path';
import * as fs from 'fs';
import {z} from 'zod';
import {parse} from 'csv-parse';

import {PluginInterface} from '../../interfaces';
import {ConfigParams, PluginParams} from '../../types/common';

import {validate} from '../../util/validations';
import {buildErrorMessage} from '../../util/helpers';
import {ERRORS} from '../../util/errors';

import {InstanceInput, RegionInput} from './types';
import {AWS_HEADERS, AZURE_HEADERS, GSF_HEADERS} from './config';

const AWS_INSTANCES = path.resolve(__dirname, './aws-instances.csv');
const AZURE_INSTANCES = path.resolve(__dirname, './azure-instances.csv');
const GSF_DATA = path.resolve(__dirname, './gsf-data.csv');

const {UnsupportedValueError} = ERRORS;

export const CloudMetadata = (): PluginInterface => {
  const SUPPORTED_CLOUDS = ['aws', 'azure'] as const;
  const errorBuilder = buildErrorMessage(CloudMetadata.name);
  const metadata = {
    kind: 'execute',
  };

  /**
   * Get provided cloud data into input.
   */
  const execute = async (inputs: PluginParams[], config?: ConfigParams) => {
    const results: PluginParams[] = [];

    for await (const input of inputs) {
      const safeInput = Object.assign({}, input, validateInput(input));
      const outputParameters = (config && config['fields']) || [];
      const region = input['cloud/region'];
      const draftInput: Record<string, any> = {};

      // Process instance metadata based on cloud vendor
      if (safeInput['cloud/instance-type']) {
        Object.assign(draftInput, await processInstanceTypeData(safeInput));
      }

      // Process region metadata based on cloud vendor
      if (region) {
        Object.assign(draftInput, await processRegionData(safeInput));
      }

      const configuredParmeters = configureOutput(draftInput, outputParameters);
      Object.assign(safeInput, configuredParmeters);

      results.push(safeInput);
    }

    return results;
  };

  /**
   * Processes region data based on input parameters.
   */
  const processRegionData = async (input: PluginParams) => {
    const region = input['cloud/region'];
    const vendor = input['cloud/vendor'];

    const regionInput: RegionInput = await getVendorRegion(vendor, region);

    if (!regionInput) {
      throw new UnsupportedValueError(
        errorBuilder({
          message: `'${region}' region is not supported in '${vendor}' cloud vendor`,
        })
      );
    }
    return {
      'cloud/region-cfe': regionInput['cfe-region'],
      'cloud/region-em-zone-id': regionInput['em-zone-id'],
      'cloud/region-wt-id': regionInput['wt-region-id'],
      'cloud/region-location': regionInput['location'],
      'cloud/region-geolocation': regionInput['geolocation'].trim(),
    };
  };

  /**
   * Processes instance type based on input parameters.
   */
  const processInstanceTypeData = async (input: PluginParams) => {
    const vendor = input['cloud/vendor'];
    const instanceType = input['cloud/instance-type'];

    const instance: InstanceInput = await getVendorInstance(
      vendor,
      instanceType
    );

    if (!instance) {
      throw new UnsupportedValueError(
        errorBuilder({
          scope: 'cloud/instance-type',
          message: `'${instanceType}' instance type is not supported in '${vendor}' cloud vendor`,
        })
      );
    }

    return {
      'vcpus-allocated': parseInt(instance['cpu-cores-utilized']),
      'vcpus-total': parseInt(instance['cpu-cores-available']),
      'memory-available': parseInt(instance['memory-available']),
      'physical-processor': instance['cpu-model-name'],
      'cpu/thermal-design-power': parseFloat(instance['cpu-tdp']),
    };
  };

  /**
   * Configures parameters for output.
   */
  const configureOutput = (
    input: Record<string, any>,
    outputParameters: string[]
  ): Record<string, any> => {
    if (outputParameters.length === 0) {
      return input;
    }
    return Object.fromEntries(
      Object.entries(input).filter(([key]) => outputParameters.includes(key))
    );
  };

  /**
   * Executes the function associated with the specified vendor type and region.
   */
  const getVendorRegion = async (vendor: string, region: string) => {
    const cloudProvider: {[key: string]: string} = {
      aws: 'Amazon Web Services',
      azure: 'Microsoft Azure',
      gcp: 'Google Cloud',
    };

    const result = await readCSVFile(GSF_DATA, GSF_HEADERS);

    const filteredResult = result.find(
      item =>
        item['cloud-provider'] === cloudProvider[vendor] &&
        (item['cloud-region'] === region || item['cfe-region'] === region)
    );

    return filteredResult;
  };

  /**
   * Execute the function associated with the specified vendor type and get the instance.
   */
  const getVendorInstance = async (vendor: string, instanceType: string) => {
    const vendorType: Record<string, () => Promise<any>> = {
      aws: async () => {
        const result = await readCSVFile(AWS_INSTANCES, AWS_HEADERS);
        return result.find(
          instance => instance['instance-class'] === instanceType
        );
      },
      azure: async () => {
        if (instanceType.includes('-')) {
          const [instanceFamily, instanceSize] = instanceType.split('-');
          const sizeNumberIndex = instanceSize.search(/\D/);
          const instanceSizeNumber = instanceSize.slice(sizeNumberIndex);

          instanceType = `${instanceFamily}${instanceSizeNumber}`;
        }

        const result = await readCSVFile(AZURE_INSTANCES, AZURE_HEADERS);
        return result.find(
          instance => instance['instance-class'] === instanceType
        );
      },
    };

    return vendorType[vendor]();
  };

  const readCSVFile = async (file: string, headers: string[]) => {
    const result = [];
    const parser = fs
      .createReadStream(file)
      .pipe(parse({delimiter: ',', columns: headers}));
    for await (const record of parser) {
      result.push(record);
    }

    result.shift();

    return result;
  };

  /**
   * Checks for required fields in input.
   */
  const validateInput = (input: PluginParams) => {
    const schema = z.object({
      'cloud/vendor': z.enum(SUPPORTED_CLOUDS, {
        required_error: `Only ${SUPPORTED_CLOUDS} is currently supported`,
      }),
      'cloud/instance-type': z.string(),
      'cloud/region': z.string().optional(),
    });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  return {
    metadata,
    execute,
  };
};
