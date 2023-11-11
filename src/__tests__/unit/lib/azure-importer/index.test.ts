import {MockAzureCredentials, MockComputeManagementClient, MockMonitorClient,} from '../../../../__mocks__/azure';
import {AzureImporterModel} from '../../../../lib/azure-importer';

jest.mock('@azure/identity', () => ({
  __esModule: true,
  DefaultAzureCredential: MockAzureCredentials,
}));

jest.mock('@azure/arm-monitor', () => ({
  __esModule: true,
  MonitorClient: MockMonitorClient,
}));

jest.mock('@azure/arm-compute', () => ({
  __esModule: true,
  ComputeManagementClient: MockComputeManagementClient,
}));

jest.setTimeout(30000);

describe('lib/azure-importer: ', () => {
  describe('init AzureImporterModel: ', () => {
    it('initalizes object with properties.', async () => {
      const azureModel = await new AzureImporterModel();
      expect(azureModel).toHaveProperty('authenticate');
      expect(azureModel).toHaveProperty('configure');
      expect(azureModel).toHaveProperty('execute');
    });
  });

  describe('configure(): ', () => {
    it('configures model instance with given params.', async () => {
      const params = {};
      const model = await new AzureImporterModel().configure(params);

      expect(model).toBeInstanceOf(AzureImporterModel);
    });
  });

  describe('authenticate(): ', () => {
    it('authenticate is undefined', async () => {
      const azureModel = await new AzureImporterModel().configure({});
      expect(azureModel).toBeInstanceOf(AzureImporterModel);
    });
  });

  describe('configure(): ', () => {
    it('configure returns name and empty config', async () => {
      const azureModel = new AzureImporterModel();
      await expect(azureModel.configure({})).resolves.toBeInstanceOf(
        AzureImporterModel
      );
      expect(azureModel.staticParams).toStrictEqual({});
    });
  });

  describe('execute(): ', () => {
    it('throws error for missing input field.', async () => {
      const azureModel = new AzureImporterModel();
      expect.assertions(2);
      expect(await azureModel.configure({})).toBeInstanceOf(
        AzureImporterModel
      );
      try {
        await azureModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'azure-observation-aggregation': 'average',
            'azure-subscription-id': '9de7e19f-8a18-4e73-9451-45fc74e7d0d3',
            'azure-resource-group': 'vm1_group',
            'azure-vm-name': 'vm1',
          },
        ]);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
        }
      }
    });

    it('throws error if time is provided in seconds.', async () => {
      const azureModel = new AzureImporterModel();

      expect.assertions(2);

      try {
        await azureModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'azure-observation-window': '5 sec',
            'azure-observation-aggregation': 'average',
            'azure-subscription-id': '9de7e19f-8a18-4e73-9451-45fc74e7d0d3',
            'azure-resource-group': 'vm1_group',
            'azure-vm-name': 'vm1',
          },
        ]);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual(
            'The minimum unit of time for azure importer is minutes'
          );
        }
      }
    });

    it('throws error for time unit of seconds ', async () => {
      const azureModel = new AzureImporterModel();
      await expect(
        azureModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'azure-observation-window': '5 sec',
            'azure-observation-aggregation': 'average',
            'azure-subscription-id': '9de7e19f-8a18-4e73-9451-45fc74e7d0d3',
            'azure-resource-group': 'vm1_group',
            'azure-vm-name': 'vm1',
          },
        ])
      ).rejects.toStrictEqual(
        Error('The minimum unit of time for azure importer is minutes')
      );
    });

    it('returns valid data.', async () => {
      const azureModel = new AzureImporterModel();
      await expect(
        azureModel.execute([
          {
            timestamp: '2023-11-02T10:35:00.000Z',
            duration: 300,
            'azure-observation-window': '5 mins',
            'azure-observation-aggregation': 'average',
            'azure-subscription-id': '9de7e19f-8a18-4e73-9451-45fc74e7d0d3',
            'azure-resource-group': 'vm1_group',
            'azure-vm-name': 'vm1',
          },
        ])
      ).resolves.toEqual([
        {
          'azure-observation-aggregation': 'average',
          'azure-observation-window': '5 mins',
          'azure-resource-group': 'vm1_group',
          'azure-subscription-id': '9de7e19f-8a18-4e73-9451-45fc74e7d0d3',
          'azure-vm-name': 'vm1',
          timestamp: '2023-11-02T10:35:00.000Z',
          duration: 300,
          'cpu-util': '3.14',
          'mem-availableGB': 0.5,
          'mem-usedGB': 0.5,
          'total-memoryGB': 1,
          'mem-util': 50,
          location: 'uksouth',
          'cloud-instance-type': 'Standard_B1s',
          'cloud-vendor': 'azure',
        },
      ]);
    });
  });
});
