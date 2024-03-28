import {ENet} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/e-net', () => {
  describe('ENet: ', () => {
    const eNet = ENet({});

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect.assertions(2);

        expect(eNet).toHaveProperty('metadata');
        expect(eNet).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('calculates energy for each input.', async () => {
        const globalConfig = {'energy-per-gb': 0.002};
        const eNet = ENet(globalConfig);
        const inputs = [
          {
            'network/data-in': 10,
            'network/data-out': 5,
            duration: 3600,
            timestamp: '2022-01-01T01:00:00Z',
          },
          {
            'network/data-in': 20,
            'network/data-out': 15,
            duration: 3600,
            timestamp: '2022-01-01T01:00:00Z',
          },
        ];

        expect.assertions(3);

        const result = await eNet.execute(inputs);

        expect(result).toHaveLength(inputs.length);
        result.forEach((output, index) => {
          expect(output['network/energy']).toBeCloseTo(
            (inputs[index]['network/data-in'] +
              inputs[index]['network/data-out']) *
              globalConfig['energy-per-gb']
          );
        });
      });
    });

    it('throws an error in case if data-in and data-out params are missing from the input.', async () => {
      expect.assertions(1);

      try {
        await eNet.execute([
          {
            duration: 3600,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
      }
    });
  });
});

describe('execute() without global config: ', () => {
  it('calculates energy for each input.', async () => {
    const globalConfig = {};
    const eNet = ENet(globalConfig);
    const inputs = [
      {
        'network/data-in': 10,
        'network/data-out': 5,
        duration: 3600,
        timestamp: '2022-01-01T01:00:00Z',
      },
      {
        'network/data-in': 20,
        'network/data-out': 15,
        duration: 3600,
        timestamp: '2022-01-01T01:00:00Z',
      },
    ];

    expect.assertions(3);

    const result = await eNet.execute(inputs);

    expect(result).toHaveLength(inputs.length);
    result.forEach((output, index) => {
      expect(output['network/energy']).toBeCloseTo(
        (inputs[index]['network/data-in'] + inputs[index]['network/data-out']) *
          0.001
      );
    });
  });
});
