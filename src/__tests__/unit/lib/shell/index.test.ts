import {describe, expect, jest, test} from '@jest/globals';
import {ShellModel} from '../../../../lib';

jest.setTimeout(30000);

describe('lib/shell-imp: ', () => {
  describe('shell:configure', () => {
    test('initialize with params', async () => {
      const outputModel = new ShellModel();
      await outputModel.configure({
        executable: 'python3 /usr/local/bin/sampler'
      });
      await expect(
        outputModel.execute([
          {duration: 3600, cpu: 0.5, timestamp: '2021-01-01T00:00:00Z'},
        ])
      ).resolves.toStrictEqual([
        {duration: 3600, cpu: 0.5, timestamp: '2021-01-01T00:00:00Z', energy: 1},
      ]);
    });
  });
});
