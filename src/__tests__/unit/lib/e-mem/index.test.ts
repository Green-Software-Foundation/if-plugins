import {EMemModel} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/e-mem: ', () => {
  describe('EMemModel: ', () => {
    let eMemModel: EMemModel;

    beforeEach(() => {
      eMemModel = new EMemModel();
    });

    describe('init:', () => {
      it('successfully initalized.', () => {
        expect(eMemModel).toHaveProperty('configure');
        expect(eMemModel).toHaveProperty('execute');
      });
    });

    describe('configure(): ', () => {
      it('configure EMemModel', async () => {
        const configuredModel = await eMemModel.configure();
        expect(configuredModel).toBe(eMemModel);
      });

      it('configures model instance with given params.', async () => {
        const configuredModel = await eMemModel.configure();
        expect.assertions(1);

        expect(configuredModel).toBeInstanceOf(EMemModel);
      });
    });

    describe('execute(): ', () => {
      it('calculate energy for each input', async () => {
        const inputs = [
          {
            'mem-util': 80,
            'total-memoryGB': 16,
            coefficient: 0.002,
            duration: 3600,
            timestamp: '2022-01-01T01:00:00Z',
          },
          {
            'mem-util': 60,
            'total-memoryGB': 8,
            coefficient: 0.001,
            duration: 3600,
            timestamp: '2022-01-01T01:00:00Z',
          },
        ];

        const result = await eMemModel.execute(inputs);

        expect(result).toHaveLength(inputs.length);
        result.forEach((output, index) => {
          expect(output['energy-memory']).toBeCloseTo(
            inputs[index]['total-memoryGB'] *
              (inputs[index]['mem-util'] / 100) *
              inputs[index]['coefficient']
          );
        });
      });

      it('throws error for missing input data.', async () => {
        try {
          await eMemModel.execute([
            {duration: 3600, timestamp: '2022-01-01T01:00:00Z'},
          ]);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws error when one of the metric is missing from the input field.', async () => {
        try {
          await eMemModel.execute([
            {
              timestamp: '2023-11-02T10:35:31.820Z',
              duration: 3600,
              'total-memoryGB': 3,
              coefficient: 0.38,
            },
          ]);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('does not throw error for missing coefficient, but uses default 0.38.', async () => {
        const data = [
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'mem-util': 30,
            'total-memoryGB': 3,
          },
        ];

        const response = await eMemModel.execute(data);

        const expectedMemory =
          data[0]['total-memoryGB'] * (data[0]['mem-util'] / 100) * 0.38;

        expect(response[0]['energy-memory']).toEqual(expectedMemory);
      });
    });
  });
});
