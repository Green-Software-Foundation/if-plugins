import {MockObservations} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/mock-observations: ', () => {
  describe('init: ', () => {
    it('successfully initalized.', () => {
      const mockObservations = MockObservations({
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
            'cpu/utilization': {min: 10, max: 95},
            'memory/utilization': {min: 10, max: 85},
          },
        },
      });

      expect(mockObservations).toHaveProperty('metadata');
      expect(mockObservations).toHaveProperty('execute');
    });
  });

  describe('execute(): ', () => {
    it('executes successfully.', async () => {
      const config = {
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
      };
      const mockObservations = MockObservations(config);
      const result = await mockObservations.execute([]);

      expect.assertions(1);

      expect(result).toStrictEqual([
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

    it('throws when `generators` are not provided.', async () => {
      const config = {
        'timestamp-from': '2023-07-06T00:00',
        'timestamp-to': '2023-07-06T00:01',
        duration: 5,
        components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
      };

      expect.assertions(2);

      try {
        const mockObservations = MockObservations(config);
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            'MockObservations: generators missing from global config.'
          )
        );
      }
    });

    it('throws when `components` are not provided.', async () => {
      const config = {
        'timestamp-from': '2023-07-06T00:00',
        'timestamp-to': '2023-07-06T00:01',
        duration: 5,
        generators: {
          common: {
            region: 'uk-west',
            'common-key': 'common-val',
          },
          randint: {
            'cpu/utilization': {min: 10, max: 95},
            'memory/utilization': {min: 10, max: 85},
          },
        },
      };

      expect.assertions(2);

      try {
        const mockObservations = MockObservations(config);
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            'MockObservations: components missing from global config.'
          )
        );
      }
    });

    it('throws when `duration` is not provided.', async () => {
      expect.assertions(2);

      try {
        const mockObservations = MockObservations({
          'timestamp-from': '2023-07-06T00:00',
          'timestamp-to': '2023-07-06T00:01',
          components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
          generators: {
            common: {
              region: 'uk-west',
              'common-key': 'common-val',
            },
            randint: {
              'cpu/utilization': {min: 10, max: 95},
              'memory/utilization': {min: 10, max: 85},
            },
          },
        });
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            'MockObservations: duration missing from global config.'
          )
        );
      }
    });

    it('throws when `timestamp-to` is not provided.', async () => {
      expect.assertions(2);

      try {
        const mockObservations = MockObservations({
          'timestamp-from': '2023-07-06T00:00',
          duration: 5,
          components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
          generators: {
            common: {
              region: 'uk-west',
              'common-key': 'common-val',
            },
            randint: {
              'cpu/utilization': {min: 10, max: 95},
              'memory/utilization': {min: 10, max: 85},
            },
          },
        });
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            'MockObservations: timestamp-to missing from global config.'
          )
        );
      }
    });

    it('throws when `timestamp-from` is missing.', async () => {
      expect.assertions(2);

      try {
        const mockObservations = MockObservations({
          'timestamp-to': '2023-07-06T00:01',
          duration: 5,
          components: [{'instance-type': 'A1'}, {'instance-type': 'B1'}],
          generators: {
            common: {
              region: 'uk-west',
              'common-key': 'common-val',
            },
            randint: {
              'cpu/utilization': {min: 10, max: 95},
              'memory/utilization': {min: 10, max: 85},
            },
          },
        });
        await mockObservations.execute([]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect(error).toEqual(
          new InputValidationError(
            'MockObservations: timestamp-from missing from global config.'
          )
        );
      }
    });
  });
});
