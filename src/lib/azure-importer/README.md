
# Azure-importer

The Azure importer model allows you to provide some basic details about an Azure virtual machine and automatically populate your `impl` with usage metrics that can then be passed along a model pipeline to calculate energy and carbon impacts.


## Prerequisites

### First, you need to have a VM instance running on Azure

You can create one using [portal.azure.com](https://portal.azure.com). You also need to create a metrics application for that virtual machine and assign the relevant permissions.

### Next, Provide an Azure identity for the IEF Azure Importer to access Azure VM metadata and observability metrics

The Azure Importer uses [AzureDefaultCredentials](https://learn.microsoft.com/en-us/dotnet/api/azure.identity.defaultazurecredential?view=azure-dotnet) method which is an abstraction for different scenarios of authentication

* When hosting the IEF Azure Importer on an Azure service, you can provide a [managed identity](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview).
* When running the Azure Importer outside of Azure, e.g. on your local machine, you can use an [App registration](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app) (an App registration is a representation of a technical service principal account; you can view it as an identity for your App on Azure).

The following steps in this tutorial use a service principal. You can learn more on https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app

### Create An App registration/service principal for the Azure Importer

On the Azure Portal, search for **App registrations**, then create a new one with default values.
![image](https://github.com/Green-Software-Foundation/if-docs/assets/966110/f77fd653-4386-4f4b-9488-ea7ae521d7d1)


Then create a credential secret for this App registration, to use it for authentication with the Azure Importer => note that secret
![image](https://github.com/Green-Software-Foundation/if-docs/assets/966110/c3f380e1-2bc9-471f-b212-ce8c31a158b1)


Then, on the Overview Tab, copy/paste the **client_id** and **tenant_id** for this App registration
![image](https://github.com/Green-Software-Foundation/if-docs/assets/966110/e1615088-9ee6-41ef-a340-7ab72c1bc488)

Now we have credentials to authenticate to Azure as the service principal (of this App registration)

### Provide IAM access rights for the service principal to Query Azure VM info
next, we need to provide access rights to this service principal to the test VM (or its resource group).

On the IAM Tab of the Ressource Group that contains the VM, add a new Role Assignment

![image](https://github.com/Green-Software-Foundation/if-docs/assets/966110/0588530c-bd67-4876-b26b-c076d5cda08d)


We'll need 2 role Assignments:

* Reader
* Monitor Reader
  
![image](https://github.com/Green-Software-Foundation/if-docs/assets/966110/52af6111-dde3-4f99-8739-769d72fdb5d8)

Then Add the service principal you created as a member for the Role assignment
![image](https://github.com/Green-Software-Foundation/if-docs/assets/966110/be097243-66a7-421a-9cee-e8fe77906a82)

Repeat for the role Monitor Reader
![image](https://github.com/Green-Software-Foundation/if-docs/assets/966110/5bf34f7a-9a01-4eb8-b3a4-aed70db44e72)




### On your local machine, add the service principal credentials ENV vars to Azure Importer

you should create a `.env` file in the IF project root directory. This is where you can store your Azure authentication details. Your `.env` file should look as follows:

```txt
AZURE_TENANT_ID: <your-tenant-id>
AZURE_CLIENT_ID: <your-client-id> 
AZURE_CLIENT_SECRET: <your-client-secret>
```

## Inputs

All that remains is to provide the details about your virtual machine in the `inputs` field in your `impl`.
These are the required fields:

- `timestamp`: An ISO8601 timestamp indicating the start time for your observation period. We work out your `timespan` by adding `duration` to this initial start time.
- `duration`: Number of seconds your observation period should last. We add this number of seconds to `timestamp` to work out when your observation period should stop.
- `azure-observation-window`: The time interval between measurements (temporal resolution) as a string with a value and a unit, e.g. `5 mins`. The value and unit must be space-separated. 
- `azure-observation-aggregation`: This indicates how you want metrics to be aggregated between each `interval`. The recommended default is `average`.
- `azure-subscription-id`: Your Azure subscription ID, e.g. 9cf5e19b-8b18-4c37-9541-55fc47ad70c3
- `azure-resource-group`: Your Azure resource group name
- `azure-vm-name`: Your virtual machine name

These are all provided as `inputs`. You also need to instantiate an `azure-importer` model to handle the Azure-specific `input` data. Here's what a complete `impl` could look like:

```
name: azure-demo
description: example impl invoking Azure model
initialize:
  models:
    - name: azure-importer
      kind: builtin
graph:
  children:
    child:
      pipeline:
        - azure-importer
      config:
        azure-importer:
      inputs:
          - timestamp: '2023-11-02T10:35:31.820Z'
            duration: 3600
            azure-observation-window: 5 min  
            azure-observation-aggregation: 'average'
            azure-subscription-id: 9cf5e19b-8b18-4c37-9541-55fc47ad70c3
            azure-resource-group: my_group
            azure-vm-name: my_vm
```

This will grab Azure metrics for `my_vm` in `my_group` for a one hour period beginning at 10:35 UTC on 2nd November 2023, at 5 minute resolution, aggregating data occurring more frequently than 5 minutes by averaging. 


## Outputs

The Azure importer model will enrich your `impl` with the following data:

- `duration`: the per-input duration in seconds, calculated from `azure-observation-window`
- `cpu-util`: percentage CPU utilization
- `cloud-instance-type`: VM instance name
- `location`: VM region
- `mem-availableGB`: Amount of memory *not* in use by your application, in GB.
- `mem-usedGB`: Amount of memory being used by your application, in GB. Calculated as the difference between `total-memoryGB` and `memory-availableGB`.
- `total-memoryGB`: The total memory allocated to your virtual machine, in GB.
- `mem-util`: memory utilized, expressed as a percentage (`memory-usedGB`/`total-memoryGB` * 100)

These can be used as inputs in other models in the pipeline. Typically, the `instance-type` can be used to obtain `tdp` data that can then, along with `cpu-util`, feed a model such as `teads-curve`. 

The outputs look as follows:

```yaml
outputs:
  - timestamp: '2023-11-02T10:35:00.000Z'
    duration: 300
    cpu-util: '0.314'
    mem-availableGB: 0.488636416
    mem-usedGB: 0.5113635839999999
    total-memoryGB: '1'
    mem_util: 51.13635839999999
    location: uksouth
    cloud-instance-type: Standard_B1s
  - timestamp: '2023-11-02T10:40:00.000Z'
      duration: 300
    cpu-util: '0.314'
    mem-availableGB: 0.48978984960000005
    mem-usedGB: 0.5102101504
    total-memoryGB: '1'
    mem_util: 51.021015039999995
    location: uksouth
    cloud-instance-type: Standard_B1s
...
```