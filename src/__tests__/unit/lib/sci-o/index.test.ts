import {describe, expect, jest, test} from '@jest/globals';
import {SciOModel} from '../../../../lib';

jest.setTimeout(30000);

describe('ccf:configure test', () => {
  test('initialize and test', async () => {
    const model = await new SciOModel().configure({});
    expect(model).toBeInstanceOf(SciOModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 1,
          'grid-carbon-intensity': 200.0,
          energy: 100.0,
        },
      ])
    ).resolves.toStrictEqual([
      {
        timestamp: '2021-01-01T00:00:00Z',
        duration: 1,
        'grid-carbon-intensity': 200.0,
        energy: 100.0,
        'operational-carbon': 100.0 * 200.0,
      },
    ]);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 1,
          'grid-carbon-intensity': 212.1,
          energy: 100.0,
        },
      ])
    ).resolves.toStrictEqual([
      {
        timestamp: '2021-01-01T00:00:00Z',
        duration: 1,
        'grid-carbon-intensity': 212.1,
        energy: 100.0,
        'operational-carbon': 100.0 * 212.1,
      },
    ]);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 1,
          'grid-carbon-intensityd': 212.1,
          energy: 100.0,
        },
      ])
    ).rejects.toThrowError();
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 1,
          'grid-carbon-intensity': 212.1,
        },
      ])
    ).rejects.toThrowError();
  });
});
