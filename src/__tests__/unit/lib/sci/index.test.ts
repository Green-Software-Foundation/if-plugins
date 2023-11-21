import { describe, expect, jest } from '@jest/globals';
import { SciModel } from '../../../../lib';

jest.setTimeout(30000);

describe('sci:configure test', () => {
  it('initialize and test calculations with vaild inputs', async () => {
    const model = await new SciModel().configure({});
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
  it('initialize and test: vary input duration ', async () => {
    const model = await new SciModel().configure({});
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
  it('initialize and test: vary time unit', async () => {
    const model = await new SciModel().configure({});
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
  it('tests model throws excetion on missing functional unit data', async () => {
    const model = await new SciModel().configure({});
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 0.002,
          'embodied-carbon': 0.0005,
          'functional-unit': 'requests',
          duration: 1,
        },
      ])
    ).rejects.toThrowError('functional-unit-time is not available');
  });
  it('tests model throws exception on invalid functional unit data', async () => {
    const model = await new SciModel().configure({});
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 0.002,
          'embodied-carbon': 0.0005,
          'functional-unit': 'requests',
          'functional-unit-time': 'bad-data',
          duration: 1,
        },
      ])
    ).rejects.toThrowError(
      'functional-unit-time is not a valid positive number'
    );
  });
  it('tests model throws exception on negative time value', async () => {
    const model = await new SciModel().configure({});
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 0.002,
          'embodied-carbon': 0.0005,
          'functional-unit': 'requests',
          'functional-unit-time': '-1 hour',
          duration: 1,
        },
      ])
    ).rejects.toThrowError(
      'functional-unit-time is not a valid positive number'
    );
  });
  it('tests model throws exception on invalid time unit', async () => {
    const model = await new SciModel().configure({});
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 0.002,
          'embodied-carbon': 0.0005,
          'functional-unit': 'requests',
          'functional-unit-time': '1 badData',
          duration: 1,
        },
      ])
    ).rejects.toThrowError(
      'functional-unit-time is not in recognized unit of time'
    );
  });
  it('tests model accepts underscore separated values in functional-unit-time', async () => {
    const model = await new SciModel().configure({});
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 0.002,
          'embodied-carbon': 0.0005,
          'functional-unit': 'requests',
          'functional-unit-time': '2_d',
          duration: 1,
        },
      ])
    ).resolves.toStrictEqual([
      {
        timestamp: '2021-01-01T00:00:00Z',
        'operational-carbon': 0.002,
        'embodied-carbon': 0.0005,
        'functional-unit': 'requests',
        'functional-unit-time': '2_d',
        carbon: 0.0025,
        duration: 1,
        sci: 432,
      },
    ]);
  });
  it('tests model accepts hyphen separated values in functional-unit-time', async () => {
    const model = await new SciModel().configure({});
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 0.002,
          'embodied-carbon': 0.0005,
          'functional-unit': 'requests',
          'functional-unit-time': '2-d',
          duration: 1,
        },
      ])
    ).resolves.toStrictEqual([
      {
        timestamp: '2021-01-01T00:00:00Z',
        'operational-carbon': 0.002,
        'embodied-carbon': 0.0005,
        'functional-unit': 'requests',
        'functional-unit-time': '2-d',
        carbon: 0.0025,
        duration: 1,
        sci: 432,
      },
    ]);
  });
  it('tests model throws exception on bad string formatting (bad separator) in functional-unit-time', async () => {
    const model = await new SciModel().configure({});
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 0.002,
          'embodied-carbon': 0.0005,
          'functional-unit': 'requests',
          'functional-unit-time': '1/d',
          duration: 1,
        },
      ])
    ).rejects.toThrowError(
      'Error parsing functional-unit-time. Please ensure you have provided one value and one unit and they are either space, underscore or hyphen separated'
    );
  });
  it('tests model throws exception on bad string formatting (no separator) in functional-unit-time', async () => {
    const model = await new SciModel().configure({});
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'operational-carbon': 0.002,
          'embodied-carbon': 0.0005,
          'functional-unit': 'requests',
          'functional-unit-time': '1hour',
          duration: 1,
        },
      ])
    ).rejects.toThrowError(
      'Error parsing functional-unit-time. Please ensure you have provided one value and one unit and they are either space, underscore or hyphen separated'
    );
  });
});
