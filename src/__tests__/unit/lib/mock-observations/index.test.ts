import {describe, expect, jest, test} from '@jest/globals';
import {MockObservations} from '../../../../lib';

jest.setTimeout(30000);

describe('lib/mock-observations', () => {
  describe('configure', () => {
    test('configure with undefined config', async () => {
      const mockObservations = new MockObservations();
      await expect(mockObservations.configure(undefined)).rejects.toThrow();
    });
    test('configure successfully', async () => {
      const mockObservations = new MockObservations();
      mockObservations.configure({
        'timestamp-from': '2023-07-06T00:00',
        'timestamp-to': '2023-07-06T00:01',
        duration: 5,
        components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
        generators: {
          common: {
            region: 'uk-west',
            'common-key': 'common-val',
          },
          randint: {
            'cpu-util': {min: 10, max: 95},
            'cpu-mem': {min: 10, max: 85},
          },
        },
      });
    });
    test('configure without timestamp-from', async () => {
      const mockObservations = new MockObservations();
      await expect(
        mockObservations.configure({
          'timestamp-to': '2023-07-06T00:01',
          duration: 5,
          components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
          generators: {
            common: {
              region: 'uk-west',
              'common-key': 'common-val',
            },
            randint: {
              'cpu-util': {min: 10, max: 95},
              'cpu-mem': {min: 10, max: 85},
            },
          },
        })
      ).rejects.toThrow();
    });
    test('configure without timestamp-to', async () => {
      const mockObservations = new MockObservations();
      await expect(
        mockObservations.configure({
          'timestamp-from': '2023-07-06T00:00',
          duration: 5,
          components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
          generators: {
            common: {
              region: 'uk-west',
              'common-key': 'common-val',
            },
            randint: {
              'cpu-util': {min: 10, max: 95},
              'cpu-mem': {min: 10, max: 85},
            },
          },
        })
      ).rejects.toThrow();
    });
    test('configure without duration', async () => {
      const mockObservations = new MockObservations();
      await expect(
        mockObservations.configure({
          'timestamp-from': '2023-07-06T00:00',
          'timestamp-to': '2023-07-06T00:01',
          components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
          generators: {
            common: {
              region: 'uk-west',
              'common-key': 'common-val',
            },
            randint: {
              'cpu-util': {min: 10, max: 95},
              'cpu-mem': {min: 10, max: 85},
            },
          },
        })
      ).rejects.toThrow();
    });
    test('configure without components', async () => {
      const mockObservations = new MockObservations();
      await expect(
        mockObservations.configure({
          'timestamp-from': '2023-07-06T00:00',
          'timestamp-to': '2023-07-06T00:01',
          duration: 5,
          generators: {
            common: {
              region: 'uk-west',
              'common-key': 'common-val',
            },
            randint: {
              'cpu-util': {min: 10, max: 95},
              'cpu-mem': {min: 10, max: 85},
            },
          },
        })
      ).rejects.toThrow();
    });
    test('configure without generators', async () => {
      const mockObservations = new MockObservations();
      await expect(
        mockObservations.configure({
          'timestamp-from': '2023-07-06T00:00',
          'timestamp-to': '2023-07-06T00:01',
          duration: 5,
          components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
        })
      ).rejects.toThrow();
    });
  });
  describe('execute', () => {
    test('execute successfully', async () => {
      const mockObservations = new MockObservations();
      mockObservations.configure({
        'timestamp-from': '2023-07-06T00:00',
        'timestamp-to': '2023-07-06T00:01',
        duration: 30,
        components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
        generators: {
          common: {
            region: 'uk-west',
            'common-key': 'common-val',
          },
        },
      });
      await expect(mockObservations.execute([])).resolves.toStrictEqual([
        {
          'common-key': 'common-val',
          duration: 30,
          'instance-type': 'A1',
          region: 'uk-west',
          timestamp: '2023-07-06 00:00:00',
        },
        {
          'common-key': 'common-val',
          duration: 30,
          'instance-type': 'A1',
          region: 'uk-west',
          timestamp: '2023-07-06 00:00:30',
        },
        {
          'common-key': 'common-val',
          duration: 30,
          'instance-type': 'A1',
          region: 'uk-west',
          timestamp: '2023-07-06 00:01:00',
        },
        {
          'common-key': 'common-val',
          duration: 30,
          'instance-type': 'B1',
          region: 'uk-west',
          timestamp: '2023-07-06 00:00:00',
        },
        {
          'common-key': 'common-val',
          duration: 30,
          'instance-type': 'B1',
          region: 'uk-west',
          timestamp: '2023-07-06 00:00:30',
        },
        {
          'common-key': 'common-val',
          duration: 30,
          'instance-type': 'B1',
          region: 'uk-west',
          timestamp: '2023-07-06 00:01:00',
        },
      ]);
    });
  });
});
