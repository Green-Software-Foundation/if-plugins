import {EMemModel} from '../../../../lib';
//import { ERRORS } from '../../../../util/errors';
//const { InputValidationError } = ERRORS;

jest.setTimeout(30000);

describe('lib/e-mem: ', () => {
  describe('init AzureImporterModel: ', () => {
    it('initalizes object with properties.', async () => {
      const eMemModel = await new EMemModel();
      expect(eMemModel).toHaveProperty('authenticate');
      expect(eMemModel).toHaveProperty('configure');
      expect(eMemModel).toHaveProperty('execute');
    });
  });

  describe('configure(): ', () => {
    it('configures model instance with given params.', async () => {
      const params = {};
      const model = await new EMemModel().configure(params);
      expect(model).toBeInstanceOf(EMemModel);
    });
  });

  describe('configure(): ', () => {
    it('configure returns name and empty config', async () => {
      const eMemModel = new EMemModel();
      await expect(eMemModel.configure({})).resolves.toBeInstanceOf(EMemModel);
      expect(eMemModel.staticParams).toStrictEqual({});
    });
  });

  describe('execute(): ', () => {
    it('throws error for missing input data.', async () => {
      const eMemModel = new EMemModel();
      expect.assertions(1);
      expect(await eMemModel.configure({})).toBeInstanceOf(EMemModel);
      try {
        await eMemModel.execute([]);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual('Input data is missing.');
        }
      }
    });
    it('throws error for missing mem-util input field.', async () => {
      const eMemModel = new EMemModel();
      expect.assertions(3);
      expect(await eMemModel.configure({})).toBeInstanceOf(EMemModel);
      try {
        await eMemModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'total-memoryGB': 3,
            'mem-energy': 0.38,
          },
        ]);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual(
            'EMemModel: mem-util is missing or invalid.'
          );
        }
      }
    });
    it('throws error for missing total-memoryGB input field.', async () => {
      const eMemModel = new EMemModel();
      expect.assertions(3);
      expect(await eMemModel.configure({})).toBeInstanceOf(EMemModel);
      try {
        await eMemModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'mem-util': 30,
            'mem-energy': 0.38,
          },
        ]);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual(
            'EMemModel: total-memoryGB is missing or invalid.'
          );
        }
      }
    });
    it('does not throw error for missing coefficient, but uses default 0.38.', async () => {
      const eMemModel = new EMemModel();
      await expect(
        eMemModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'mem-util': 30,
            'total-memoryGB': 3,
          },
        ])
      ).resolves.toEqual([
        {
          timestamp: '2023-11-02T10:35:31.820Z',
          duration: 3600,
          'mem-util': 30,
          'total-memoryGB': 3,
          'energy-memory': 0.34199999999999997,
        },
      ]);
    });
  });
  describe('calculateEnergy(): ', () => {
    it('allows coefficient to vary.', async () => {
      const eMemModel = new EMemModel();
      await expect(
        eMemModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'mem-util': 30,
            'total-memoryGB': 3,
            coefficient: 0.98,
          },
        ])
      ).resolves.toEqual([
        {
          timestamp: '2023-11-02T10:35:31.820Z',
          duration: 3600,
          'mem-util': 30,
          'total-memoryGB': 3,
          coefficient: 0.98,
          'energy-memory': 0.8819999999999999,
        },
      ]);
    });
  });
  describe('calculateEnergy(): ', () => {
    it('calculates correct energy-memory with input set 1.', async () => {
      const eMemModel = new EMemModel();
      await expect(
        eMemModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'mem-util': 10,
            'total-memoryGB': 1,
            coefficient: 0.38,
          },
        ])
      ).resolves.toEqual([
        {
          timestamp: '2023-11-02T10:35:31.820Z',
          duration: 3600,
          'mem-util': 10,
          'total-memoryGB': 1,
          coefficient: 0.38,
          'energy-memory': 0.038000000000000006,
        },
      ]);
    });
    it('calculates correct energy-memory with input set 2.', async () => {
      const eMemModel = new EMemModel();
      await expect(
        eMemModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'mem-util': 30,
            'total-memoryGB': 1,
            coefficient: 0.38,
          },
        ])
      ).resolves.toEqual([
        {
          timestamp: '2023-11-02T10:35:31.820Z',
          duration: 3600,
          'mem-util': 30,
          'total-memoryGB': 1,
          coefficient: 0.38,
          'energy-memory': 0.11399999999999999,
        },
      ]);
    });
  });
});
