import {ENetModel} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/sci-o', () => {
  describe('ENetModel', () => {
    let eNetModel: ENetModel;

    beforeEach(() => {
      eNetModel = new ENetModel();
    });

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(eNetModel).toHaveProperty('configure');
        expect(eNetModel).toHaveProperty('execute');
      });
    });

    describe('configure(): ', () => {
      it('configure ENetModel', async () => {
        const configuredModel = await eNetModel.configure();
        expect.assertions(1);

        expect(configuredModel).toBeInstanceOf(ENetModel);
      });
    });

    describe('execute(): ', () => {
      it('calculate energy for each input', async () => {
        const inputs = [
          {
            'data-in': 10,
            'data-out': 5,
            'network-energy-coefficient': 0.002,
            duration: 3600,
            timestamp: '2022-01-01T01:00:00Z',
          },
          {
            'data-in': 20,
            'data-out': 15,
            'network-energy-coefficient': 0.001,
            duration: 3600,
            timestamp: '2022-01-01T01:00:00Z',
          },
        ];

        const result = await eNetModel.execute(inputs);

        expect(result).toHaveLength(inputs.length);
        result.forEach((output, index) => {
          expect(output['energy-network']).toBeCloseTo(
            (inputs[index]['data-in'] + inputs[index]['data-out']) *
              inputs[index]['network-energy-coefficient']
          );
        });
      });
    });

    it('network-energy-coefficient have a default value if the param is missing or is 0 from the input.', async () => {
      const inputs = [
        {
          'data-in': 10,
          'data-out': 5,
          duration: 3600,
          timestamp: '2022-01-01T01:00:00Z',
        },
        {
          'data-in': 20,
          'data-out': 15,
          'network-energy-coefficient': 0,
          duration: 3600,
          timestamp: '2022-01-01T01:00:00Z',
        },
      ];
      const result = await eNetModel.execute(inputs);

      expect(result).toHaveLength(inputs.length);

      expect(result[0]['network-energy-coefficient']).toEqual(0.001);
      expect(result[1]['network-energy-coefficient']).toEqual(0.001);
    });

    it('should throw an error in case if data-in and data-out params are missing from the input.', async () => {
      try {
        await eNetModel.execute([
          {
            duration: 3600,
            timestamp: '2021-01-01T00:00:00Z',
            'network-energy-coefficient': 0.001,
          },
        ]);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
      }
    });
  });
});
