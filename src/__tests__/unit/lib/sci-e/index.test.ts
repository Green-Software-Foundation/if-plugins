import {SciEModel} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/sci-e: ', () => {
  describe('SciEModel: ', () => {
    describe('init: ', () => {
      it('successfully initalized.', () => {
        const outputModel = new SciEModel();

        expect(outputModel).toHaveProperty('configure');
        expect(outputModel).toHaveProperty('execute');
      });
    });

    describe('configure(): ', () => {
      it('successfully returns model instance.', async () => {
        const outputModel = new SciEModel();
        await outputModel.configure();

        expect.assertions(1);

        expect(outputModel).toBeInstanceOf(SciEModel);
      });
    });

    describe('execute(): ', () => {
      it('successfully applies SCI-E strategy to given input.', async () => {
        const outputModel = new SciEModel();

        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            'energy-cpu': 1,
            'energy-network': 1,
            'energy-memory': 1,
            energy: 3,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await outputModel.execute([
          {
            duration: 3600,
            'energy-cpu': 1,
            'energy-network': 1,
            'energy-memory': 1,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('should throw error in case if some params are missing from input.', async () => {
        const outputModel = new SciEModel();
        const expectedMessage =
          'At least one of energy-cpu,energy-memory,energy-network should present.';

        expect.assertions(1);

        try {
          await outputModel.execute([
            {
              duration: 3600,
              timestamp: '2021-01-01T00:00:00Z',
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(expectedMessage)
          );
        }
      });

      it('should run with one of the params in inputs.', async () => {
        const outputModel = new SciEModel();

        expect.assertions(1);

        const data = [
          {
            duration: 3600,
            timestamp: '2021-01-01T00:00:00Z',
            'energy-cpu': 1,
          },
        ];
        const response = await outputModel.execute(data);

        const expectedResult = [{...data[0], energy: data[0]['energy-cpu']}];

        expect(response).toEqual(expectedResult);
      });
    });
  });
});
