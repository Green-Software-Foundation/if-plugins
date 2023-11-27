import {AggregateModel} from '../../../../lib';
import {ERRORS} from '../../../../util/errors';
const {InputValidationError} = ERRORS;

jest.setTimeout(30000);

describe('lib/aggregate: ', () => {
  describe('init AggregateModel: ', () => {
    it('initalizes object with properties.', async () => {
      const aggregateModel = await new AggregateModel();
      expect(aggregateModel).toHaveProperty('configure');
      expect(aggregateModel).toHaveProperty('execute');
    });
  });
  describe('AggregateModel execute(): ', () => {
    it('Generates correct values for aggregate-energy and aggregate-carbon with method === sum.', async () => {
      const aggregateModel = await new AggregateModel().configure({
        'aggregation-metrics': ['carbon', 'energy'],
        'aggregation-method': 'sum',
      });
      await expect(
        aggregateModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            energy: 10,
            carbon: 5,
          },
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            energy: 10,
            carbon: 5,
          },
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            energy: 10,
            carbon: 5,
          },
        ])
      ).resolves.toEqual([
        {
          duration: 3600,
          timestamp: '2023-11-02T10:35:31.820Z',
          energy: 10,
          carbon: 5,
          'aggregate-energy': 30,
          'aggregate-carbon': 15,
        },
        {
          duration: 3600,
          timestamp: '2023-11-02T10:35:31.820Z',
          energy: 10,
          carbon: 5,
          'aggregate-energy': 30,
          'aggregate-carbon': 15,
        },
        {
          duration: 3600,
          timestamp: '2023-11-02T10:35:31.820Z',
          energy: 10,
          carbon: 5,
          'aggregate-energy': 30,
          'aggregate-carbon': 15,
        },
      ]);
    });
    it('Generates correct values for aggregate-energy and aggregate-carbon with method === average.', async () => {
      const aggregateModel = await new AggregateModel().configure({
        'aggregation-method': 'avg',
        'aggregation-metrics': ['energy', 'carbon'],
      });
      expect(aggregateModel).toBeInstanceOf(AggregateModel);
      await expect(
        aggregateModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            energy: 10,
            carbon: 5,
          },
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            energy: 10,
            carbon: 5,
          },
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            energy: 10,
            carbon: 5,
          },
        ])
      ).resolves.toEqual([
        {
          duration: 3600,
          timestamp: '2023-11-02T10:35:31.820Z',
          energy: 10,
          carbon: 5,
          'aggregate-energy': 10,
          'aggregate-carbon': 5,
        },
        {
          duration: 3600,
          timestamp: '2023-11-02T10:35:31.820Z',
          energy: 10,
          carbon: 5,
          'aggregate-energy': 10,
          'aggregate-carbon': 5,
        },
        {
          duration: 3600,
          timestamp: '2023-11-02T10:35:31.820Z',
          energy: 10,
          carbon: 5,
          'aggregate-energy': 10,
          'aggregate-carbon': 5,
        },
      ]);
    });
    it('Throws when expected metrics are not in inputs.', async () => {
      const aggregateModel = await new AggregateModel().configure({
        'aggregation-method': 'avg',
        'aggregation-metrics': ['carbon', 'energy', 'dummy'],
      });
      expect(aggregateModel).toBeInstanceOf(AggregateModel);
      await expect(
        aggregateModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            energy: 10,
            carbon: 5,
          },
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            energy: 10,
            carbon: 5,
          },
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            energy: 10,
            carbon: 5,
          },
        ])
      ).rejects.toStrictEqual(
        new InputValidationError(
          'AggregateModel: aggregation metric dummy not found in input data.'
        )
      );
    });
    it('Falls back to sum when aggregation method is invalid.', async () => {
      const aggregateModel = await new AggregateModel().configure({
        'aggregation-method': 'dummy',
        'aggregation-metrics': ['carbon'],
      });
      expect(aggregateModel).toBeInstanceOf(AggregateModel);
      await expect(
        aggregateModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            energy: 10,
            carbon: 5,
          },
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            energy: 10,
            carbon: 5,
          },
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            energy: 10,
            carbon: 5,
          },
        ])
      ).resolves.toStrictEqual([
        {
          timestamp: '2023-11-02T10:35:31.820Z',
          duration: 3600,
          energy: 10,
          carbon: 5,
          'aggregate-carbon': 15,
        },
        {
          timestamp: '2023-11-02T10:35:31.820Z',
          duration: 3600,
          energy: 10,
          carbon: 5,
          'aggregate-carbon': 15,
        },
        {
          timestamp: '2023-11-02T10:35:31.820Z',
          duration: 3600,
          energy: 10,
          carbon: 5,
          'aggregate-carbon': 15,
        },
      ]);
    });
  });
});
