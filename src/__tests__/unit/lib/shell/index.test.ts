import {spawnSync} from 'child_process';
import {loadAll} from 'js-yaml';

import {ShellModel} from '../../../../lib';

jest.mock('child_process');
jest.mock('js-yaml');

describe('lib/shell', () => {
  describe('ShellModel', () => {
    let shellModel: ShellModel;

    beforeEach(() => {
      shellModel = new ShellModel();
    });

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(shellModel).toHaveProperty('configure');
        expect(shellModel).toHaveProperty('execute');
      });
    });

    describe('configure(): ', () => {
      it('configure ShellModel', async () => {
        expect.assertions(1);

        const configuredModel = await shellModel.configure();
        expect(configuredModel).toBe(shellModel);
      });
    });

    describe('execute(): ', () => {
      it('execute with valid inputs and command', async () => {
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
            command: 'python3 /path/to/script.py',
          },
        ];

        expect.assertions(2);

        await shellModel.execute(inputs);

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

        await expect(shellModel.execute(invalidInputs)).rejects.toThrow();
      });
    });
  });
});
