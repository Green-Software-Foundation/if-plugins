import { describe, expect, jest, test } from '@jest/globals';
import { SciMModel } from '../../../../lib';

jest.setTimeout(30000);

describe('sci-m:configure test', () => {
  test('initialize and test', async () => {
    const model = await new SciMModel().configure({});
    expect(model).toBeInstanceOf(SciMModel);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 1,
          'total-embodied-emissions': 200,
          'time-reserved': 60 * 60 * 24 * 30,
          'expected-lifespan': 60 * 60 * 24 * 365 * 4,
          'resources-reserved': 1,
          'total-resources': 1,
        },
        {
          timestamp: '2021-01-01T00:00:00Z',
          'total-embodied-emissions': 200,
          duration: 60 * 60 * 24 * 30 * 2,
          'time-reserved': 'duration',
          'expected-lifespan': 60 * 60 * 24 * 365 * 4,
          'resources-reserved': 1,
          'total-resources': 1,
        },
      ])
    ).resolves.toStrictEqual([
      {
        timestamp: '2021-01-01T00:00:00Z',
        duration: 1,
        'total-embodied-emissions': 200,
        'time-reserved': 60 * 60 * 24 * 30,
        'expected-lifespan': 60 * 60 * 24 * 365 * 4,
        'resources-reserved': 1,
        'total-resources': 1,
        'embodied-carbon': 4.10958904109589,
      },
      {
        timestamp: '2021-01-01T00:00:00Z',
        'total-embodied-emissions': 200,
        duration: 60 * 60 * 24 * 30 * 2,
        'time-reserved': 'duration',
        'expected-lifespan': 60 * 60 * 24 * 365 * 4,
        'resources-reserved': 1,
        'total-resources': 1,
        'embodied-carbon': 4.10958904109589 * 2,
      },
    ]);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 1,
          'total-embodied-emissions': 200,
          'time-reserved': 60 * 60 * 24 * 30,
          'expected-lifespan': 60 * 60 * 24 * 365 * 4,
          'vcpus-allocated': 1,
          'vcpus-total': 64,
        },
        {
          timestamp: '2021-01-01T00:00:00Z',
          'total-embodied-emissions': 200,
          duration: 60 * 60 * 24 * 30 * 2,
          'time-reserved': 'duration',
          'expected-lifespan': 60 * 60 * 24 * 365 * 4,
          'vcpus-allocated': 1,
          'vcpus-total': 32,
        },
      ])
    ).resolves.toStrictEqual([
      {
        timestamp: '2021-01-01T00:00:00Z',
        duration: 1,
        'total-embodied-emissions': 200,
        'time-reserved': 60 * 60 * 24 * 30,
        'expected-lifespan': 60 * 60 * 24 * 365 * 4,
        'vcpus-allocated': 1,
        'vcpus-total': 64,
        'embodied-carbon': 0.06421232876712328,
      },
      {
        timestamp: '2021-01-01T00:00:00Z',
        'total-embodied-emissions': 200,
        duration: 60 * 60 * 24 * 30 * 2,
        'time-reserved': 'duration',
        'expected-lifespan': 60 * 60 * 24 * 365 * 4,
        'vcpus-allocated': 1,
        'vcpus-total': 32,
        'embodied-carbon': 0.2568493150684931,
      },
    ]);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 1,
          'total-embodied-emissions': 200,
          'time-reserved': 60 * 60 * 24 * 30,
          'expected-lifespan': 60 * 60 * 24 * 365 * 4,
          'resources-reserved': 1,
          'total-resources': 1,
          'vcpus-allocated': 1,
          'vcpus-total': 64,
        },
        {
          timestamp: '2021-01-01T00:00:00Z',
          'total-embodied-emissions': 200,
          duration: 60 * 60 * 24 * 30 * 2,
          'time-reserved': 'duration',
          'expected-lifespan': 60 * 60 * 24 * 365 * 4,
          'resources-reserved': 1,
          'total-resources': 1,
          'vcpus-allocated': 1,
          'vcpus-total': 32,
        },
      ])
    ).resolves.toStrictEqual([
      {
        timestamp: '2021-01-01T00:00:00Z',
        duration: 1,
        'total-embodied-emissions': 200,
        'time-reserved': 60 * 60 * 24 * 30,
        'expected-lifespan': 60 * 60 * 24 * 365 * 4,
        'resources-reserved': 1,
        'total-resources': 1,
        'vcpus-allocated': 1,
        'vcpus-total': 64,
        'embodied-carbon': 0.06421232876712328,
      },
      {
        timestamp: '2021-01-01T00:00:00Z',
        'total-embodied-emissions': 200,
        duration: 60 * 60 * 24 * 30 * 2,
        'time-reserved': 'duration',
        'expected-lifespan': 60 * 60 * 24 * 365 * 4,
        'resources-reserved': 1,
        'total-resources': 1,
        'vcpus-allocated': 1,
        'vcpus-total': 32,
        'embodied-carbon': 0.2568493150684931,
      },
    ]);
    await expect(
      model.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          'total-embodied-emissions': 200,
          tee: 200,
          duration: 60 * 60 * 24 * 30 * 2,
          'time-reserved': 'duration',
          'expected-lifespan': 60 * 60 * 24 * 365 * 4,
          'resources-reserved': 1,
          'total-ressources': 1,
          'embodied-carbon': 4.10958904109589 * 2,
        },
      ])
    ).rejects.toThrowError();
  });
});
