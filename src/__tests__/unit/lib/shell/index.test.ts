import {spawnSync} from 'child_process';
import {loadAll} from 'js-yaml';

import {Shell} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError} = ERRORS;

jest.mock('child_process');
jest.mock('js-yaml');

describe('lib/shell', () => {
  describe('Shell', () => {
    const shell = Shell({});

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(shell).toHaveProperty('metadata');
        expect(shell).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('execute with valid inputs and command', async () => {
        const shell = Shell({command: 'python3 /path/to/script.py'});
        const mockSpawnSync = spawnSync as jest.MockedFunction<
          typeof spawnSync
        >;
        mockSpawnSync.mockReturnValueOnce({stdout: 'mocked stdout'} as any);

        const mockLoadAll = loadAll as jest.MockedFunction<typeof loadAll>;
        mockLoadAll.mockReturnValueOnce(['mocked output'] as any);

        const inputs = [
          {
            duration: 3600,
            timestamp: '2022-01-01T00:00:00Z',
          },
        ];

        expect.assertions(2);

        await shell.execute(inputs);

        expect(mockSpawnSync).toHaveBeenCalledWith(
          'python3',
          ['/path/to/script.py'],
          {
            encoding: 'utf8',
          }
        );
        expect(mockLoadAll).toHaveBeenCalledWith('mocked stdout');
      });

      it('throw an error if validation fails', async () => {
        const invalidInputs = [
          {duration: 3600, timestamp: '2022-01-01T00:00:00Z', command: 123},
        ];
        expect.assertions(1);

        await expect(shell.execute(invalidInputs)).rejects.toThrow();
      });

      it('throw an error when shell could not run command.', async () => {
        const shell = Shell({command: 'python3 /path/to/script.py'});
        (spawnSync as jest.Mock).mockImplementation(() => {
          throw new InputValidationError('Could not run the command');
        });

        const inputs = [
          {
            duration: 3600,
            timestamp: '2022-01-01T00:00:00Z',
          },
        ];
        expect.assertions(2);

        try {
          await shell.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
          expect(error).toStrictEqual(
            new InputValidationError('Could not run the command')
          );
        }
      });
    });
  });
});
