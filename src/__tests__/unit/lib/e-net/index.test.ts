import { ENetModel } from '../../../../lib';
//import { ERRORS } from '../../../../util/errors';
//const { InputValidationError } = ERRORS;

jest.setTimeout(30000);

describe('lib/e-net: ', () => {
  describe('init: ', () => {
    it('initalizes object with properties.', async () => {
      const eNetModel = await new ENetModel();
      expect(eNetModel).toHaveProperty('configure');
      expect(eNetModel).toHaveProperty('execute');
    });
  });

  describe('configure(): ', () => {
    it('configures model instance with given params.', async () => {
      const params = {};
      const model = await new ENetModel().configure(params);
      expect(model).toBeInstanceOf(ENetModel);
    });
    it('configures model instance with given params.', async () => {
      const model = await new ENetModel().configure();
      expect(model).toBeInstanceOf(ENetModel);
    });
  });

  describe('configure(): ', () => {
    it('configure returns name and empty config', async () => {
      const eNetModel = new ENetModel();
      await expect(eNetModel.configure({})).resolves.toBeInstanceOf(ENetModel);
      expect(eNetModel.staticParams).toStrictEqual({});
    });
  });

  describe('execute(): ', () => {
    it('throws error for missing input data.', async () => {
      const eNetModel = new ENetModel();
      expect.assertions(3);
      expect(await eNetModel.configure({})).toBeInstanceOf(ENetModel);
      try {
        await eNetModel.execute([]);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual('ENetModel: Input data is missing.');
        }
      }
    });
    it('throws error for missing data-in input field.', async () => {
      const eNetModel = new ENetModel();
      expect.assertions(2);
      expect(await eNetModel.configure({})).toBeInstanceOf(ENetModel);
      await expect(
        eNetModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'data-out': 4,
            'network-energy-coefficient': 100,
          },
        ])
      ).rejects.toThrow();
    });
    it('throws error for missing data-out input field.', async () => {
      const eNetModel = new ENetModel();
      expect.assertions(2);
      expect(await eNetModel.configure({})).toBeInstanceOf(ENetModel);
      await expect(
        eNetModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'data-in': 3,
            'network-energy-coefficient': 100,
          },
        ])
      ).rejects.toThrow();
    });
    it('falls back to default value for invalid network-energy-coefficient input field value', async () => {
      const eNetModel = new ENetModel();
      expect.assertions(2);
      expect(await eNetModel.configure({})).toBeInstanceOf(ENetModel);
      await expect(
        eNetModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'data-in': 3,
            'data-out': 4,
          },
        ])
      ).resolves.toEqual([
        {
          timestamp: '2023-11-02T10:35:31.820Z',
          duration: 3600,
          'data-in': 3,
          'data-out': 4,
          'network-energy-coefficient': 0.001,
          'energy-network': 0.007,
        },
      ]

      );
    });
    it('falls back to default value for network-energy-coefficient == 0', async () => {
      const eNetModel = new ENetModel();
      expect.assertions(2);
      expect(await eNetModel.configure({})).toBeInstanceOf(ENetModel);
      await expect(
        eNetModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'data-in': 3,
            'data-out': 4,
            'network-energy-coefficient': 0,
          },
        ])
      ).resolves.toEqual([
        {
          timestamp: '2023-11-02T10:35:31.820Z',
          duration: 3600,
          'data-in': 3,
          'data-out': 4,
          'network-energy-coefficient': 0.001,
          'energy-network': 0.007,
        },
      ]

      );
    });
  });
  describe('calculateEnergy(): ', () => {
    it('calculate happy path.', async () => {
      const eNetModel = new ENetModel();
      await expect(
        eNetModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'data-in': 3,
            'data-out': 4,
            'network-energy-coefficient': 100,
          },
        ])
      ).resolves.toEqual([
        {
          timestamp: '2023-11-02T10:35:31.820Z',
          duration: 3600,
          'data-in': 3,
          'data-out': 4,
          'network-energy-coefficient': 100,
          'energy-network': 700,
        },
      ]);
    });
  });
  describe('calculateEnergy(): ', () => {
    it('calculates network energy consistewnt with case study example.', async () => {
      const eNetModel = new ENetModel();
      await expect(
        eNetModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'data-in': 1.16,
            'data-out': 14.3,
            'network-energy-coefficient': 0.001,
          },
        ])
      ).resolves.toEqual([
        {
          timestamp: '2023-11-02T10:35:31.820Z',
          duration: 3600,
          'data-in': 1.16,
          'data-out': 14.3,
          'network-energy-coefficient': 0.001,
          'energy-network': 0.015460000000000002,
        },
      ]);
    });
  });
});
