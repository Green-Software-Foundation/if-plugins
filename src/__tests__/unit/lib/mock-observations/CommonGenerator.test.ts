import {KeyValuePair} from '../../../../types/common';

import {ERRORS} from '../../../../util/errors';

import {CommonGenerator} from '../../../../lib/mock-observations/helpers/CommonGenerator';

const {InputValidationError} = ERRORS;

describe('lib/mock-observations/CommonGenerator: ', () => {
  describe('initialize: ', () => {
    it('initialize with an empty config.', async () => {
      try {
        CommonGenerator({});
      } catch (error) {
        expect(error).toEqual(
          new InputValidationError(
            'CommonGenerator: Config must not be null or empty.'
          )
        );
      }
    });
  });

  describe('next(): ', () => {
    it('returns a result with valid data.', async () => {
      const config: KeyValuePair = {
        key1: 'value1',
        key2: 'value2',
      };
      const commonGenerator = CommonGenerator(config);

      expect(commonGenerator.next([])).toStrictEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });
  });
});
