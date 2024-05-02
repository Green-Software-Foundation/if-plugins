import * as fs from 'fs/promises';
import {jest} from '@jest/globals';

import {GrafanaExport} from '../../../../lib/grafana-export';

import {ERRORS} from '../../../../util/errors';

const {MakeDirectoryError, WriteFileError, InputValidationError} = ERRORS;

jest.mock('fs/promises', () => ({
  mkdir: jest.fn<() => Promise<void>>().mockResolvedValue(),
  writeFile: jest.fn<() => Promise<void>>().mockResolvedValue(),
}));

describe('lib/grafana-export: ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const path = 'mock-pathToFile';
  const standardConfig = {
    'output-path': path,
  };

  describe('execute(): ', () => {
    it('executes with custom headers timestamp and duration and write to csv.', async () => {
      const basicConfig = {
        'output-path': path,
        headers: ['timestamp', 'duration'],
      };
      const grafanaExport = GrafanaExport();

      const input = [
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
          energy: 10,
          carbon: 2,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          energy: 20,
          carbon: 5,
        },
      ];

      const result = await grafanaExport.execute(input, basicConfig);

      expect.assertions(3);

      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(
        path,
        'timestamp,duration\r\n2023-12-12T00:00:00.000Z,10\r\n2023-12-12T00:00:10.000Z,30'
      );

      expect(result).toStrictEqual(input);
    });

    it('executes with custom headers and write csv to file.', async () => {
      const basicConfig = {
        'output-path': path,
        headers: ['timestamp', 'duration', 'water'],
      };
      const grafanaExport = GrafanaExport();

      const input = [
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
          water: 2000,
          'embodied-carbon': 2,
          energy: 50,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          water: 500,
          'embodied-carbon': 5,
          energy: 10,
        },
      ];

      const result = await grafanaExport.execute(input, basicConfig);

      expect.assertions(3);

      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(
        path,
        'timestamp,duration,water\r\n2023-12-12T00:00:00.000Z,10,2000\r\n2023-12-12T00:00:10.000Z,30,500'
      );

      expect(result).toStrictEqual(input);
    });

    it('executes with empty headers and will write all input data to csv.', async () => {
      const grafanaExport = GrafanaExport();

      const input = [
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
          water: 2000,
          carbon: 2,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          water: 500,
          carbon: 5,
        },
      ];

      const result = await grafanaExport.execute(input, standardConfig);

      expect.assertions(3);

      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(
        path,
        'timestamp,duration,water,carbon\r\n2023-12-12T00:00:00.000Z,10,2000,2\r\n2023-12-12T00:00:10.000Z,30,500,5'
      );

      expect(result).toStrictEqual(input);
    });

    it('throws an error when node config is not provided.', async () => {
      const grafanaExport = GrafanaExport();

      const input = [
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
          energy: 10,
          carbon: 2,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          energy: 20,
          carbon: 5,
        },
      ];

      expect.assertions(2);

      try {
        await grafanaExport.execute(input);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            'GrafanaExport: Configuration data is missing.'
          )
        );
      }
    });

    it('throws an error when a file writing fails.', async () => {
      (fs.writeFile as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });
      const grafanaExport = GrafanaExport();

      const input = [
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
        },
      ];

      expect.assertions(2);

      try {
        await grafanaExport.execute(input, standardConfig);
      } catch (error) {
        expect(error).toBeInstanceOf(WriteFileError);
        expect(error).toEqual(
          new WriteFileError(
            `GrafanaExport: Failed to write CSV to ${path} Error: Permission denied.`
          )
        );
      }
    });

    it('throws en error when a file creating fails.', async () => {
      (fs.mkdir as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const grafanaExport = GrafanaExport();
      const input = [
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
        },
      ];

      expect.assertions(2);

      try {
        await grafanaExport.execute(input, standardConfig);
      } catch (error) {
        expect(error).toBeInstanceOf(MakeDirectoryError);
        expect(error).toEqual(
          new MakeDirectoryError(
            'GrafanaExport: Failed to create directory for CSV at path: . Error: Permission denied.'
          )
        );
      }
    });
  });
});
