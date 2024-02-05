import {ERRORS} from '../../../../util/errors';
import {describe, expect, jest, test} from '@jest/globals';
import RandIntGenerator from '../../../../lib/mock-observations/helpers/RandIntGenerator';
import {KeyValuePair} from '../../../../types/common';

const {InputValidationError} = ERRORS;

jest.setTimeout(30000);

describe('lib/mock-observations/RandIntGenerator', () => {
  describe('initialize', () => {
    test('initialise with an empty name', async () => {
      const randIntGenerator = new RandIntGenerator();
      try {
        randIntGenerator.initialise('', {});
      } catch (error) {
        expect(error).toEqual(
          new InputValidationError(
            'RandIntGenerator: name is empty or all spaces.'
          )
        );
      }
    });
    test('initialise with an empty config', async () => {
      const randIntGenerator = new RandIntGenerator();
      try {
        randIntGenerator.initialise('generator-name', {});
      } catch (error) {
        expect(error).toEqual(
          new InputValidationError(
            'RandIntGenerator: Config must not be null or empty.'
          )
        );
      }
    });
  });
  describe('next', () => {
    test('next', async () => {
      const randIntGenerator = new RandIntGenerator();
      const config: KeyValuePair = {
        min: 10,
        max: 90,
      };
      randIntGenerator.initialise('random', config);
      const result = randIntGenerator.next([]) as {random: number};
      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('random');
      expect(result.random).toBeGreaterThanOrEqual(10);
      expect(result.random).toBeLessThanOrEqual(90);
    });
  });
});
