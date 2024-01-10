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
      it('should', async () => {
        const outputModel = new SciEModel();
        await outputModel.configure();

        expect.assertions(1);

        expect(outputModel).toBeInstanceOf(SciEModel);
      });
    });

    describe('execute(): ', () => {
      it('successfully runs with given input.', async () => {
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
          '"energy-cpu" parameter is required. Error code: invalid_type.,"energy-memory" parameter is required. Error code: invalid_type.,"energy-network" parameter is required. Error code: invalid_type.';

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
    });
  });
});
