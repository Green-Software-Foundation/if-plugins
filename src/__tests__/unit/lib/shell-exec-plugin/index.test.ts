import {spawnSync} from 'child_process';
import {loadAll} from 'js-yaml';

import {ShellExecPlugin} from '../../../../lib';

jest.mock('child_process');
jest.mock('js-yaml');

describe('lib/shell', () => {
  describe('Shell', () => {
    const shell = ShellExecPlugin({});

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(shell).toHaveProperty('metadata');
        expect(shell).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('execute with valid inputs and command', async () => {
        const shell = ShellExecPlugin({command: 'python3 /path/to/script.py'});
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
    });
  });
});
