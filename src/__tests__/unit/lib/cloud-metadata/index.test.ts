import {CloudMetadata} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError, UnsupportedValueError} = ERRORS;

describe('lib/cloud-metadata:', () => {
  describe('CloudMetadata', () => {
    const cloudMetadata = CloudMetadata();

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(cloudMetadata).toHaveProperty('metadata');
        expect(cloudMetadata).toHaveProperty('execute');
      });
    });

    describe('execute():', () => {
      it('returns a result with valid aws inputs.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 5,
            'cloud/instance-type': 'm5n.large',
            'cloud/vendor': 'aws',
          },
        ];
        const result = await cloudMetadata.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 5,
            'cloud/instance-type': 'm5n.large',
            'cloud/vendor': 'aws',
            'physical-processor': 'Intel® Xeon® Platinum 8259CL',
            'vcpus-allocated': 2,
            'vcpus-total': 96,
            'memory-available': 8,
            'cpu/thermal-design-power': 210,
          },
        ]);
      });

      it('returns a result with valid azure inputs.', async () => {
        const inputs = [
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 'Standard_NC24-23s_v3',
            'cloud/vendor': 'azure',
          },
        ];

        const result = await cloudMetadata.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 'Standard_NC24-23s_v3',
            'cloud/vendor': 'azure',
            'physical-processor': 'Intel® Xeon® E5-2690 v4',
            'vcpus-allocated': 24,
            'vcpus-total': 28,
            'memory-available': 448,
            'cpu/thermal-design-power': 135,
          },
        ]);
      });

      it('returns a result when azure instance type do not have size number.', async () => {
        const inputs = [
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 'Standard_B1ms',
            'cloud/vendor': 'azure',
          },
        ];

        const result = await cloudMetadata.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 'Standard_B1ms',
            'cloud/vendor': 'azure',
            'cpu/thermal-design-power': 270,
            'physical-processor':
              'Intel® Xeon® Platinum 8370C,Intel® Xeon® Platinum 8272CL,Intel® Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz,Intel® Xeon® E5-2673 v3 2.4 GHz',
            'vcpus-allocated': 1,
            'vcpus-total': 64,
            'memory-available': 2,
          },
        ]);
      });

      it('returns a result with configured outputs.', async () => {
        const inputs = [
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 'Standard_A1_v2',
            'cloud/vendor': 'azure',
            'cloud/region': 'francesouth',
          },
        ];
        const config = {
          fields: [
            'cloud/vendor',
            'cloud/region-wt-id',
            'cloud/instance-type',
            'physical-processor',
            'cpu/thermal-design-power',
          ],
        };
        const result = await cloudMetadata.execute(inputs, config);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 'Standard_A1_v2',
            'cloud/region': 'francesouth',
            'cloud/region-wt-id': 'FR',
            'cloud/vendor': 'azure',
            'cpu/thermal-design-power': 205,
            'physical-processor':
              'Intel® Xeon® Platinum 8272CL,Intel® Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz,Intel® Xeon® E5-2673 v3 2.4 GHz',
          },
        ]);
      });

      it('returns a result when provided a `cloud/region` in the input.', async () => {
        const inputs = [
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 'Standard_A1_v2',
            'cloud/vendor': 'azure',
            'cloud/region': 'francesouth',
          },
        ];

        const result = await cloudMetadata.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 'Standard_A1_v2',
            'cloud/region': 'francesouth',
            'cloud/region-cfe': 'France',
            'cloud/region-em-zone-id': 'FR',
            'cloud/region-geolocation': '48.8567,2.3522',
            'cloud/region-location': 'Paris',
            'cloud/region-wt-id': 'FR',
            'cloud/vendor': 'azure',
            'cpu/thermal-design-power': 205,
            'memory-available': 2,
            'physical-processor':
              'Intel® Xeon® Platinum 8272CL,Intel® Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz,Intel® Xeon® E5-2673 v3 2.4 GHz',
            'vcpus-allocated': 1,
            'vcpus-total': 52,
          },
        ]);
      });

      it('throws an error when provided a wrong `cloud/region` for vendor in the input.', async () => {
        const errorMessage =
          "CloudMetadata: 'uk-west' region is not supported in 'azure' cloud vendor.";
        const inputs = [
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 'Standard_A1_v2',
            'cloud/vendor': 'azure',
            'cloud/region': 'uk-west',
          },
        ];

        expect.assertions(2);

        try {
          await cloudMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new UnsupportedValueError(errorMessage));
          expect(error).toBeInstanceOf(UnsupportedValueError);
        }
      });

      it('throws on `cloud/instance-type` when `cloud/vendor` is aws.', async () => {
        const errorMessage =
          "CloudMetadata(cloud/instance-type): 't2.micro2' instance type is not supported in 'aws' cloud vendor.";
        const inputs = [
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 't2.micro2',
            'cloud/vendor': 'aws',
          },
        ];

        expect.assertions(2);

        try {
          await cloudMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new UnsupportedValueError(errorMessage));
          expect(error).toBeInstanceOf(UnsupportedValueError);
        }
      });

      it('throws on `cloud/instance-type` when `cloud/vendor` is azure.', async () => {
        const errorMessage =
          "CloudMetadata(cloud/instance-type): 't2.micro2' instance type is not supported in 'azure' cloud vendor.";
        const inputs = [
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 't2.micro2',
            'cloud/vendor': 'azure',
          },
        ];

        expect.assertions(2);

        try {
          await cloudMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new UnsupportedValueError(errorMessage));
          expect(error).toBeInstanceOf(UnsupportedValueError);
        }
      });

      it('throws on unsupported `cloud/vendor`.', async () => {
        const errorMessage =
          "\"cloud/vendor\" parameter is invalid enum value. expected 'aws' | 'azure', received 'aws2'. Error code: invalid_enum_value.";
        const inputs = [
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 't2.micro',
            'cloud/vendor': 'aws2',
          },
        ];

        expect.assertions(2);

        try {
          await cloudMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws on missed required parameters.', async () => {
        const errorMessage =
          '"cloud/vendor" parameter is only aws,azure is currently supported. Error code: invalid_type.,"cloud/instance-type" parameter is required. Error code: invalid_type.';
        const inputs = [
          {
            timestamp: '',
            duration: 5,
          },
        ];

        expect.assertions(2);

        try {
          await cloudMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });
    });
  });
});
