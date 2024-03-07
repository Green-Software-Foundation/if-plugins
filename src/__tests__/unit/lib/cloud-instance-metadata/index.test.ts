import {CloudInstanceMetadata} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError, UnsupportedValueError} = ERRORS;

describe('lib/cloud-instance-metadata:', () => {
  describe('CloudInstanceMetadata', () => {
    const cloudInstanceMetadata = CloudInstanceMetadata();

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(cloudInstanceMetadata).toHaveProperty('metadata');
        expect(cloudInstanceMetadata).toHaveProperty('execute');
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
        const result = await cloudInstanceMetadata.execute(inputs);

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

        const result = await cloudInstanceMetadata.execute(inputs);

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

      it('throws on `cloud/instance-type` when `cloud/vendor` is aws.', async () => {
        const errorMessage =
          "CloudInstanceMetadata(cloud/instance-type): 't2.micro2' is not supported in 'aws'.";
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
          await cloudInstanceMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new UnsupportedValueError(errorMessage));
          expect(error).toBeInstanceOf(UnsupportedValueError);
        }
      });

      it('throws on `cloud/instance-type` when `cloud/vendor` is azure.', async () => {
        const errorMessage =
          "CloudInstanceMetadata(cloud/instance-type): 't2.micro2' is not supported in 'azure'.";
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
          await cloudInstanceMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new UnsupportedValueError(errorMessage));
          expect(error).toBeInstanceOf(UnsupportedValueError);
        }
      });

      it('throws on unsupported `cloud/vendor`.', async () => {
        const errorMessage =
          "\"cloud/vendor\" parameter is invalid enum value. expected 'aws' | 'azure' | 'gcp', received 'aws2'. Error code: invalid_union.";
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
          await cloudInstanceMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws on missed required parameters.', async () => {
        const errorMessage =
          '"cloud/vendor" parameter is only aws,azure,gcp is currently supported. Error code: invalid_union.';
        const inputs = [
          {
            timestamp: '',
            duration: 5,
          },
        ];

        expect.assertions(2);

        try {
          await cloudInstanceMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });
    });
  });
});
