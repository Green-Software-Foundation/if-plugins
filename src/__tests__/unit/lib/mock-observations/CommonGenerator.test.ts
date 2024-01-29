import {ERRORS} from '../../../../util/errors';
import {describe, expect, jest, test} from '@jest/globals';
import CommonGenerator from '../../../../lib/mock-observations/helpers/CommonGenerator';
import {KeyValuePair} from '../../../../types/common';

const {InputValidationError} = ERRORS;

jest.setTimeout(30000);
describe('lib/mock-observations/CommonGenerator', () => {
  describe('initialize', () => {
    test('initialise with an empty config', async () => {
      const commonGenerator = new CommonGenerator();
      try {
        commonGenerator.initialise({});
      } catch (error) {
        expect(error).toEqual(
          new InputValidationError(
            'CommonGenerator: Config must not be null or empty.'
          )
        );
      }
    });
  });
  describe('next', () => {
    test('next', async () => {
      const commonGenerator = new CommonGenerator();
      const config: KeyValuePair = {
        key1: 'value1',
        key2: 'value2',
      };
      commonGenerator.initialise(config);
      expect(commonGenerator.next([])).toStrictEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });
  });
});
