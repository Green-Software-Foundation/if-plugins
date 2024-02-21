import { Sum } from '../../../../lib';

//import { ERRORS } from '../../../../util/errors';

//const { InputValidationError } = ERRORS;

describe('lib/sum: ', () => {
  describe('Sum: ', () => {

    const globalConfig = { inputParameters: ['cpu/energy', 'network/energy', 'memory/energy'], outputParameter: 'energy' }
    const sum = Sum(globalConfig);

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(sum).toHaveProperty('metadata');
        expect(sum).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies Sum strategy to given input.', async () => {
        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            'cpu/energy': 1,
            'network/energy': 1,
            'memory/energy': 1,
            energy: 3,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await sum.execute([
          {
            duration: 3600,
            'cpu/energy': 1,
            'network/energy': 1,
            'memory/energy': 1,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      //     it('throws an error on missing params in input.', async () => {
      //       const expectedMessage =
      //         'At least one of cpu/energy,memory/energy,network/energy should present.';

      //       expect.assertions(1);

      //       try {
      //         await sciE.execute([
      //           {
      //             duration: 3600,
      //             timestamp: '2021-01-01T00:00:00Z',
      //           },
      //         ]);
      //       } catch (error) {
      //         expect(error).toStrictEqual(
      //           new InputValidationError(expectedMessage)
      //         );
      //       }
      //     });

      //     it('returns a result with one of the params in input.', async () => {
      //       expect.assertions(1);

      //       const data = [
      //         {
      //           duration: 3600,
      //           timestamp: '2021-01-01T00:00:00Z',
      //           'cpu/energy': 1,
      //         },
      //       ];
      //       const response = await sciE.execute(data);

      //       const expectedResult = [{...data[0], energy: data[0]['cpu/energy']}];

      //       expect(response).toEqual(expectedResult);
      //     });
    });
  });
})
