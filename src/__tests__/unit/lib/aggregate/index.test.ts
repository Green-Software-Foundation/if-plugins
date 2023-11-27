import { AggregateModel } from '../../../../lib';
//import { ERRORS } from '../../../../util/errors';
//const { InputValidationError } = ERRORS;

jest.setTimeout(30000);

describe('lib/aggregate: ', () => {
    describe('init AggregateModel: ', () => {
        it('initalizes object with properties.', async () => {
            const aggregateModel = await new AggregateModel();
            expect(aggregateModel).toHaveProperty('configure');
            expect(aggregateModel).toHaveProperty('execute');
        });
    });
    describe('init AggregateModel: ', () => {
        it('does not throw error for missing coefficient, but uses default 0.38.', async () => {
            const aggregateModel = new AggregateModel();
            await expect(
                aggregateModel.execute([
                    {
                        timestamp: '2023-11-02T10:35:31.820Z',
                        duration: 3600,
                        energy: 10,
                        carbon: 5
                    },
                    {
                        timestamp: '2023-11-02T10:35:31.820Z',
                        duration: 3600,
                        energy: 10,
                        carbon: 5
                    },
                    {
                        timestamp: '2023-11-02T10:35:31.820Z',
                        duration: 3600,
                        energy: 10,
                        carbon: 5
                    },
                ])
            ).resolves.toEqual(
                [{
                    "duration": 3600,
                    "timestamp": "2023-11-02T10:35:31.820Z",
                    energy: 10,
                    carbon: 5,
                    'aggregate-energy': 30,
                    'aggregate-carbon': 15
                },
                {
                    "duration": 3600,
                    "timestamp": "2023-11-02T10:35:31.820Z",
                    energy: 10,
                    carbon: 5,
                    'aggregate-energy': 30,
                    'aggregate-carbon': 15
                },
                {
                    "duration": 3600,
                    "timestamp": "2023-11-02T10:35:31.820Z",
                    energy: 10,
                    carbon: 5,
                    'aggregate-energy': 30,
                    'aggregate-carbon': 15
                }]
            );
        });
    });
})