import {EMem} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/e-mem: ', () => {
  describe('EMem: ', () => {
    const eMem = EMem({});

    describe('init:', () => {
      it('successfully initalized.', () => {
        expect.assertions(2);

        expect(eMem).toHaveProperty('metadata');
        expect(eMem).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('calculates energy for each input.', async () => {
        const globalConfig = {'energy-per-gb': 0.002};
        const eMem = EMem(globalConfig);

        const inputs = [
          {
            'memory/utilization': 80,
            'memory/capacity': 16,
            duration: 3600,
            timestamp: '2022-01-01T01:00:00Z',
          },
          {
            'memory/utilization': 60,
            'memory/capacity': 8,
            duration: 3600,
            timestamp: '2022-01-01T01:00:00Z',
          },
        ];
        expect.assertions(3);

        const result = await eMem.execute(inputs);

        expect(result).toHaveLength(inputs.length);
        result.forEach((output, index) => {
          expect(output['memory/energy']).toBeCloseTo(
            inputs[index]['memory/capacity'] *
              (inputs[index]['memory/utilization'] / 100) *
              globalConfig['energy-per-gb']
          );
        });
      });

      it('throws error for missing input data.', async () => {
        expect.assertions(1);
        try {
          await eMem.execute([
            {duration: 3600, timestamp: '2022-01-01T01:00:00Z'},
          ]);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws error when one of the metric is missing from the input field.', async () => {
        expect.assertions(1);
        try {
          await eMem.execute([
            {
              timestamp: '2023-11-02T10:35:31.820Z',
              duration: 3600,
              'memory/capacity': 3,
            },
          ]);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('does not throw an error for a missing `energy-per-gb` but instead uses the default value of 0.000392.', async () => {
        const data = [
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'memory/utilization': 30,
            'memory/capacity': 3,
          },
        ];

        expect.assertions(1);

        const response = await eMem.execute(data);
        const expectedMemory =
          data[0]['memory/capacity'] *
          (data[0]['memory/utilization'] / 100) *
          0.000392;

        expect(response[0]['memory/energy']).toEqual(expectedMemory);
      });
    });

    describe('execute() with no global config: ', () => {
      it('gets energy-memory from fallback.', async () => {
        const globalConfig = {};
        const eMem = EMem(globalConfig);

        const inputs = [
          {
            'memory/utilization': 80,
            'memory/capacity': 16,
            duration: 3600,
            timestamp: '2022-01-01T01:00:00Z',
          },
          {
            'memory/utilization': 60,
            'memory/capacity': 8,
            duration: 3600,
            timestamp: '2022-01-01T01:00:00Z',
          },
        ];
        expect.assertions(3);

        const result = await eMem.execute(inputs);

        expect(result).toHaveLength(inputs.length);
        result.forEach((output, index) => {
          expect(output['memory/energy']).toBeCloseTo(
            inputs[index]['memory/capacity'] *
              (inputs[index]['memory/utilization'] / 100) *
              0.000392
          );
        });
      });
    });
  });
});
