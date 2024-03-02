import {Coefficient} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/coefficient: ', () => {
  describe('Coefficient: ', () => {
    const globalConfig = {
      'input-parameter': 'carbon',
      coefficient: 3,
      'output-parameter': 'carbon-product',
    };
    const coeff = Coefficient(globalConfig);

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(coeff).toHaveProperty('metadata');
        expect(coeff).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies Coefficient strategy to given input.', async () => {
        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            carbon: 3,
            'carbon-product': 9,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await coeff.execute([
          {
            duration: 3600,
            carbon: 3,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect.assertions(1);

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error on missing input-parameter param in input.', async () => {
        const invalidConfig = {
          'input-parameter': '',
          coefficient: 3,
          'output-parameter': 'carbon-product',
        };
        const coeff = Coefficient(invalidConfig);
        const expectedMessage =
          '"input-parameter" parameter is string must contain at least 1 character(s). Error code: too_small.';

        expect.assertions(1);

        try {
          await coeff.execute([
            {
              duration: 3600,
              timestamp: '2021-01-01T00:00:00Z',
              carbon: 3,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(expectedMessage)
          );
        }
      });

      it('throws an error on missing output-parameter param in input.', async () => {
        const invalidConfig = {
          'input-parameter': 'carbon',
          coefficient: 10,
          'output-parameter': '',
        };
        const coeff = Coefficient(invalidConfig);
        const expectedMessage =
          '"output-parameter" parameter is string must contain at least 1 character(s). Error code: too_small.';

        expect.assertions(1);
        try {
          await coeff.execute([
            {
              duration: 3600,
              timestamp: '2021-01-01T00:00:00Z',
              carbon: 3,
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
