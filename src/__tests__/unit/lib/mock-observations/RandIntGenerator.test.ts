import {KeyValuePair} from '../../../../types/common';

import {ERRORS} from '../../../../util/errors';

import {RandIntGenerator} from '../../../../lib/mock-observations/helpers/RandIntGenerator';

const {InputValidationError} = ERRORS;

describe('lib/mock-observations/RandIntGenerator: ', () => {
  describe('initialize', () => {
    it('initialize with an empty name', async () => {
      try {
        RandIntGenerator('', {});
      } catch (error) {
        expect(error).toEqual(
          new InputValidationError(
            'RandIntGenerator: `name` is empty or all spaces.'
          )
        );
      }
    });

    it('initialize with an empty config', async () => {
      try {
        RandIntGenerator('generator-name', {});
      } catch (error) {
        expect(error).toEqual(
          new InputValidationError(
            'RandIntGenerator: Config must not be null or empty.'
          )
        );
      }
    });
  });

  describe('next(): ', () => {
    it('returns a result with valid data.', async () => {
      const config: KeyValuePair = {
        min: 10,
        max: 90,
      };
      const randIntGenerator = RandIntGenerator('random', config);
      const result = randIntGenerator.next([]) as {random: number};

      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('random');
      expect(result.random).toBeGreaterThanOrEqual(10);
      expect(result.random).toBeLessThanOrEqual(90);
    });
  });
});
