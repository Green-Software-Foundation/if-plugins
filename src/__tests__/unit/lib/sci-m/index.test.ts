import {SciMModel} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/sci-m:', () => {
  describe('SciMModel: ', () => {
    let sciMModel: SciMModel;

    beforeEach(() => {
      sciMModel = new SciMModel();
    });

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(sciMModel).toHaveProperty('configure');
        expect(sciMModel).toHaveProperty('execute');
      });
    });

    describe('configure(): ', () => {
      it('successfully returns model instance.', async () => {
        expect.assertions(1);

        await sciMModel.configure();
        expect(sciMModel).toBeInstanceOf(SciMModel);
      });
    });

    describe('execute():', () => {
      it('returns a result with valid inputs.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'total-resources': 1,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'total-resources': 1,
          },
        ];

        const result = await sciMModel.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'total-resources': 1,
            'embodied-carbon': 4.10958904109589,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'total-resources': 1,
            'embodied-carbon': 4.10958904109589 * 2,
          },
        ]);
      });

      it('returns a result when `vcpus-allocated` and `vcpus-total` are in the input.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
          },
        ];

        const result = await sciMModel.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
            'embodied-carbon': 4.10958904109589,
          },
        ]);
      });

      it('returns a result when `vcpus-allocated` and `vcpus-total` are preferred to `resources-reserved` and `total-resources`.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 2,
            'total-resources': 2,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
            'resources-reserved': 2,
            'total-resources': 2,
          },
        ];

        const result = await sciMModel.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
            'embodied-carbon': 4.10958904109589,
            'resources-reserved': 2,
            'total-resources': 2,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
            'embodied-carbon': 4.10958904109589 * 2,
            'resources-reserved': 2,
            'total-resources': 2,
          },
        ]);
      });

      it('returns a result when `vcpus-allocated` and `vcpus-total` are miised.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'total-resources': 1,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'total-resources': 1,
          },
        ];

        const result = await sciMModel.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'embodied-carbon': 4.10958904109589,
            'resources-reserved': 1,
            'total-resources': 1,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'total-embodied-emissions': 200,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'embodied-carbon': 4.10958904109589 * 2,
            'resources-reserved': 1,
            'total-resources': 1,
          },
        ]);
      });

      it('throws an exception on missing `total-embodied-emissions`.', async () => {
        const errorMessage =
          '"total-embodied-emissions" parameter is required. Error code: invalid_union.';
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
          },
        ];

        expect.assertions(2);

        try {
          await sciMModel.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws an exception on missing `expected-lifespan`.', async () => {
        const errorMessage =
          '"expected-lifespan" parameter is required. Error code: invalid_union.';
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'total-embodied-emissions': 200,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
          },
        ];

        expect.assertions(2);

        try {
          await sciMModel.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws an exception on invalid values.', async () => {
        const errorMessage =
          '"total-embodied-emissions" parameter is expected number, received string. Error code: invalid_union.';
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'total-embodied-emissions': '200',
            'vcpus-allocated': true,
            'vcpus-total': 1,
          },
        ];

        expect.assertions(2);

        try {
          await sciMModel.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });
    });
  });
});
