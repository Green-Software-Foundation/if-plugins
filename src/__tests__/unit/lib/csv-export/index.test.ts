import {describe, expect, jest, test} from '@jest/globals';
import {CsvExportModel} from '../../../../lib/csv-export';
import * as fs from 'fs/promises';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn<() => Promise<void>>().mockResolvedValue(),
  writeFile: jest.fn<() => Promise<void>>().mockResolvedValue(),
}));

describe('lib/csv-export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const path = 'mock-pathToFile';
  const standardConfig = {
    'output-path': path,
  };

  describe('configure()', () => {
    test('configure model to be csv export model', async () => {
      const csvExportModel = new CsvExportModel().configure(standardConfig);
      await expect(csvExportModel).resolves.toBeInstanceOf(CsvExportModel);
    });

    test('configure model with missing output path will error', async () => {
      const badConfig = {};
      await expect(new CsvExportModel().configure(badConfig)).rejects.toThrow();
    });
  });

  describe('execute())', () => {
    test('execute with custom headers timestamp and duration and write to csv', async () => {
      const basicConfig = {
        'output-path': path,
        headers: ['timestamp', 'duration'],
      };
      const csvExportModel = await new CsvExportModel().configure(basicConfig);

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

      const result = await csvExportModel.execute(input);

      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(
        path,
        'timestamp,duration\r\n2023-12-12T00:00:00.000Z,10\r\n2023-12-12T00:00:10.000Z,30'
      );

      expect(result).toStrictEqual(input);
    });

    test('execute with custom headers and write csv to file', async () => {
      const basicConfig = {
        'output-path': path,
        headers: ['timestamp', 'duration', 'water'],
      };
      const csvExportModel = await new CsvExportModel().configure(basicConfig);

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

      const result = await csvExportModel.execute(input);

      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(
        path,
        'timestamp,duration,water\r\n2023-12-12T00:00:00.000Z,10,2000\r\n2023-12-12T00:00:10.000Z,30,500'
      );

      expect(result).toStrictEqual(input);
    });

    test('execute with empty headers and will write all input data to csv', async () => {
      const csvExportModel = await new CsvExportModel().configure(
        standardConfig
      );

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

      const result = await csvExportModel.execute(input);

      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(
        path,
        'timestamp,duration,water,carbon\r\n2023-12-12T00:00:00.000Z,10,2000,2\r\n2023-12-12T00:00:10.000Z,30,500,5'
      );

      expect(result).toStrictEqual(input);
    });

    test('failed to write file will return error', async () => {
      (fs.writeFile as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });
      const csvExportModel = await new CsvExportModel().configure(
        standardConfig
      );

      const input = [
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
        },
      ];

      await expect(csvExportModel.execute(input)).rejects.toThrow(
        'CsvExportModel: Failed to write CSV to ' +
          path +
          ' Error: Permission denied'
      );
    });

    test('failed to create file will return error', async () => {
      (fs.mkdir as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });
      const csvExportModel = await new CsvExportModel().configure(
        standardConfig
      );

      const input = [
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
        },
      ];

      await expect(csvExportModel.execute(input)).rejects.toThrow(
        'CsvExportModel: Failed to create directory for CSV at path: . Error: Permission denied'
      );
    });
  });
});
