import * as fs from 'fs';
import {TdpFinder} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError, UnsupportedValueError, ReadFileError} = ERRORS;

describe('lib/tdp-finder:', () => {
  describe('TdpFinder', () => {
    const tdpFinder = TdpFinder();

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(tdpFinder).toHaveProperty('metadata');
        expect(tdpFinder).toHaveProperty('execute');
      });
    });

    describe('execute():', () => {
      it('returns a result with valid inputs.', async () => {
        const inputs = [
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'physical-processor': 'AMD 3020e',
          },
        ];

        const result = await tdpFinder.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'physical-processor': 'AMD 3020e',
            'cpu/thermal-design-power': 6.0,
          },
        ]);
      });

      it('returns a result when into `physical-processor` are two processors.', async () => {
        const inputs = [
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'physical-processor': 'Intel Xeon Platinum 8175M, AMD A8-9600',
          },
        ];

        const result = await tdpFinder.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'physical-processor': 'Intel Xeon Platinum 8175M, AMD A8-9600',
            'cpu/thermal-design-power': 240.0,
          },
        ]);
      });

      it('throws on missing `physical-processor` in input.', async () => {
        const errorMessage =
          '"physical-processor" parameter is required. Error code: invalid_type.';
        const inputs = [
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
          },
        ];
        expect.assertions(2);

        try {
          await tdpFinder.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws on unsupported processor in input.', async () => {
        const errorMessage =
          "TdpFinder: 'physical-processor': AMD A8-9600f from input[0] is not found in the database.";
        const inputs = [
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'physical-processor': 'Intel Xeon Platinum 8175M,AMD A8-9600f',
          },
        ];

        expect.assertions(2);

        try {
          await tdpFinder.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new UnsupportedValueError(errorMessage));
          expect(error).toBeInstanceOf(UnsupportedValueError);
        }
      });

      it('throws an error when the file cannot be read/', async () => {
        jest.spyOn(fs.promises, 'readFile').mockRejectedValueOnce('data.csv');
        const inputs = [
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'physical-processor': 'Intel Xeon Platinum 8175M,AMD A8-9600f',
          },
        ];

        expect.assertions(2);

        try {
          await tdpFinder.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(
            new ReadFileError('Error reading file data.csv: data.csv')
          );
          expect(error).toBeInstanceOf(ReadFileError);
        }
      });
    });
  });
});
