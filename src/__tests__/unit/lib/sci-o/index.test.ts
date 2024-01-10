import {SciOModel} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/sci-o', () => {
  let sciOModel: SciOModel;

  beforeEach(() => {
    sciOModel = new SciOModel();
  });

  describe('SciOModel: ', () => {
    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(sciOModel).toHaveProperty('configure');
        expect(sciOModel).toHaveProperty('execute');
      });
    });

    describe('configure(): ', () => {
      it('should configure SciOModel', async () => {
        const configuredModel = await sciOModel.configure();

        expect.assertions(1);

        expect(configuredModel).toBeInstanceOf(SciOModel);
      });
    });

    describe('execute(): ', () => {
      it('should calculate total emissions for each input', async () => {
        const inputs = [
          {
            duration: 3600,
            timestamp: '2022-01-01T00:00:00Z',
            'grid-carbon-intensity': 50,
            energy: 10,
          },
          {
            duration: 3600,
            timestamp: '2022-01-01T01:00:00Z',
            'grid-carbon-intensity': 60,
            energy: 15,
          },
        ];

        const result = await sciOModel.execute(inputs);

        expect(result).toHaveLength(inputs.length);
        result.forEach((output, index) => {
          expect(output['operational-carbon']).toBeCloseTo(
            inputs[index]['grid-carbon-intensity'] * inputs[index]['energy']
          );
        });
      });
    });

    it('should validate single input with valid values', () => {
      const validInput = {
        duration: 3600,
        timestamp: '2022-01-01T01:00:00Z',
        'grid-carbon-intensity': 60,
        energy: 15,
      };
      expect(() => sciOModel['validateSingleInput'](validInput)).not.toThrow();
    });

    it('should throw validation error for single input with invalid values', () => {
      const invalidInput = {
        duration: 3600,
        timestamp: '2022-01-01T01:00:00Z',
        'grid-carbon-intensity': -5,
        energy: 'invalid',
      };
      expect(() => sciOModel['validateSingleInput'](invalidInput)).toThrow();
    });

    it('should throw an error in case if some params are missing from the input.', async () => {
      const expectedMessage =
        'At least one of grid-carbon-intensity or energy should present.';

      try {
        await sciOModel.execute([
          {
            duration: 3600,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);
      } catch (error) {
        expect(error).toStrictEqual(new InputValidationError(expectedMessage));
      }
    });
  });
});
