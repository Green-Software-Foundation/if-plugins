import {SciO} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/sci-o', () => {
  describe('SciO: ', () => {
    const sciO = SciO();

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(sciO).toHaveProperty('metadata');
        expect(sciO).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('calculate total emissions for each input', async () => {
        const inputs = [
          {
            duration: 3600,
            timestamp: '2022-01-01T00:00:00Z',
            'grid/carbon-intensity': 50,
            energy: 10,
          },
          {
            duration: 3600,
            timestamp: '2022-01-01T01:00:00Z',
            'grid/carbon-intensity': 60,
            energy: 15,
          },
        ];

        expect.assertions(3);

        const result = await sciO.execute(inputs);

        expect(result).toHaveLength(inputs.length);
        result.forEach((output, index) => {
          expect(output['carbon-operational']).toBeCloseTo(
            inputs[index]['grid/carbon-intensity'] * inputs[index]['energy']
          );
        });
      });

      it('throw an error in case if some params are missing from the input.', async () => {
        expect.assertions(1);

        try {
          await sciO.execute([
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
});
