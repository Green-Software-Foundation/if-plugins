import {SciModel} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/sci:', () => {
  describe('SciModel: ', () => {
    let sciModel: SciModel;

    beforeEach(() => {
      sciModel = new SciModel();
    });

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(sciModel).toHaveProperty('configure');
        expect(sciModel).toHaveProperty('execute');
      });
    });

    describe('configure(): ', () => {
      it('successfully returns model instance.', async () => {
        expect.assertions(1);

        await sciModel.configure();
        expect(sciModel).toBeInstanceOf(SciModel);
      });
    });

    describe('execute():', () => {
      it('returns a result with vaild inputs', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.02,
            'embodied-carbon': 5,
            users: 100,
            'functional-unit': 'users',
            'functional-unit-time': '1 min',
            duration: 1,
          },
        ];
        const result = await sciModel.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.02,
            'embodied-carbon': 5,
            'functional-unit': 'users',
            'functional-unit-time': '1 min',
            carbon: 5.02,
            users: 100,
            duration: 1,
            sci: 3.012,
          },
        ]);
      });

      it('returns a result with vary input duration.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.2,
            'embodied-carbon': 0.05,
            'functional-unit': 'requests',
            'functional-unit-time': '1 day',
            duration: 100,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': '1 day',
            duration: 2,
          },
        ];
        const result = await sciModel.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.2,
            'embodied-carbon': 0.05,
            'functional-unit': 'requests',
            'functional-unit-time': '1 day',
            carbon: 0.0025,
            duration: 100,
            sci: 216,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': '1 day',
            carbon: 0.00125,
            duration: 2,
            sci: 108,
          },
        ]);
      });

      it('throws an excetion on missing functional unit data.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            duration: 1,
          },
        ];
        expect.assertions(1);

        try {
          await sciModel.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws exception on invalid functional unit data.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': 'bad-data',
            duration: 1,
          },
        ];

        expect.assertions(1);

        try {
          await sciModel.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws exception on negative time value.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': '-1 hour',
            duration: 1,
          },
        ];

        expect.assertions(1);

        try {
          await sciModel.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws exception on invalid time unit.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': '1 badData',
            duration: 1,
          },
        ];
        expect.assertions(1);

        try {
          await sciModel.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('accepts underscore separated values in functional-unit-time.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': '2_d',
            duration: 1,
          },
        ];
        const result = await sciModel.execute(inputs);

        expect.assertions(1);
        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': '2_d',
            carbon: 0.0025,
            duration: 1,
            sci: 432,
          },
        ]);
      });

      it('accepts hyphen separated values in functional-unit-time.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': '2-d',
            duration: 1,
          },
        ];
        const result = await sciModel.execute(inputs);

        expect.assertions(1);
        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': '2-d',
            carbon: 0.0025,
            duration: 1,
            sci: 432,
          },
        ]);
      });

      it('throws exception on bad string formatting (bad separator) in functional-unit-time.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': '1/d',
            duration: 1,
          },
        ];

        expect.assertions(1);

        try {
          await sciModel.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws exception on bad string formatting (no separator) in functional-unit-time.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': '1hour',
            duration: 1,
          },
        ];
        expect.assertions(1);

        try {
          await sciModel.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('returns result either carbon or both of operational-carbon and embodied-carbon are in the input.', async () => {
        expect.assertions(2);

        const inputsWithCarbon = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            carbon: 0.0025,
            'functional-unit': 'requests',
            'functional-unit-time': '2-d',
            duration: 1,
          },
        ];
        const resultWithCarbon = await sciModel.execute(inputsWithCarbon);

        expect(resultWithCarbon).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'functional-unit': 'requests',
            'functional-unit-time': '2-d',
            carbon: 0.0025,
            duration: 1,
            sci: 432,
          },
        ]);

        const inputsWithoutCarbon = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': '2-d',
            duration: 1,
          },
        ];
        const resultWithoutCarbon = await sciModel.execute(inputsWithoutCarbon);

        expect(resultWithoutCarbon).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            'operational-carbon': 0.002,
            'embodied-carbon': 0.0005,
            'functional-unit': 'requests',
            'functional-unit-time': '2-d',
            carbon: 0.0025,
            duration: 1,
            sci: 432,
          },
        ]);
      });
    });
  });
});
