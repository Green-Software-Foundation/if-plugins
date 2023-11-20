import { describe, expect, jest, test } from '@jest/globals';
import { SciModel } from '../../../../lib';

jest.setTimeout(30000);

describe('sci:configure test', () => {
  test('initialize and test', async () => {
    const model = await new SciModel().configure({
    });
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 0.02,
          'embodied-carbon': 5,
          users: 100,
          'functional-unit': 'users',
          'functional-unit-time': '1 min',
          duration: 1,
        },
      ])
    ).resolves.toStrictEqual([
      {
        timestamp: '2021-01-01T00:00:00Z',
        'operational-carbon': 0.02,
        'embodied-carbon': 5,
        'functional-unit': 'users',
        'functional-unit-time': '1 min',
        carbon: 5.02,
        users: 100,
        duration: 1,
        sci: 3.012,
      },
    ]);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 20,
          'embodied-carbon': 0.005,
          'functional-unit': 'users',
          'functional-unit-time': '1 min',
          carbon: 20.005,
          users: 1000,
          duration: 1,
        },
      ])
    ).resolves.toStrictEqual([
      {
        timestamp: '2021-01-01T00:00:00Z',
        'operational-carbon': 20,
        'embodied-carbon': 0.005,
        'functional-unit': 'users',
        'functional-unit-time': '1 min',
        carbon: 20.005,
        users: 1000,
        duration: 1,
        sci: 1.2003,
      },
    ]);
  });
  test('initialize and test: vary input duration ', async () => {
    const model = await new SciModel().configure({
    });
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 0.2,
          'embodied-carbon': 0.05,
          'functional-unit': 'requests',
          'functional-unit-time': '1 day',
          duration: 100,
        },
      ])
    ).resolves.toStrictEqual([
      {
        timestamp: '2021-01-01T00:00:00Z',
        'operational-carbon': 0.2,
        'embodied-carbon': 0.05,
        'functional-unit': 'requests',
        'functional-unit-time': '1 day',
        carbon: 0.0025,
        duration: 100,
        sci: 216,
      },
    ]);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 0.002,
          'embodied-carbon': 0.0005,
          'functional-unit': 'requests',
          'functional-unit-time': '1 day',
          duration: 2,
        },
      ])
    ).resolves.toStrictEqual([
      {
        timestamp: '2021-01-01T00:00:00Z',
        'operational-carbon': 0.002,
        'embodied-carbon': 0.0005,
        'functional-unit': 'requests',
        'functional-unit-time': '1 day',
        carbon: 0.00125,
        duration: 2,
        sci: 108,
      },
    ]);
  });
  test('initialize and test: vary functional-unit-duration', async () => {
    const model = await new SciModel().configure({
    });
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 0.002,
          'embodied-carbon': 0.0005,
          'functional-unit': 'requests',
          'functional-unit-time': '2 d',
          duration: 1,
        },
      ])
    ).resolves.toStrictEqual([
      {
        timestamp: '2021-01-01T00:00:00Z',
        'operational-carbon': 0.002,
        'embodied-carbon': 0.0005,
        'functional-unit': 'requests',
        'functional-unit-time': '2 d',
        carbon: 0.0025,
        duration: 1,
        sci: 432,
      },
    ]);
  });
});
