# Cloud Instance Metadata

This plugin allows you to determine an instance's physical processor and thermal design power based on its instance name.

## Parameters

## Model Config

Not Needed

### Inputs

- `cloud-vendor`: the cloud platform provider, e.g. `aws`
- `cloud-instance-type`: the name of the specific instance being used, e.g. `m5n.large`

## Returns

An array containing:

- `cloud-instance-type`: echo input `instance-type`
- `cloud-vendor`: echo input `vendor`
- `physical-processor`: physical processor used in the given instance
- `vcpus-allocated`: number of vCPUs allocated to this instance
- `vcpus-total`: total number of vCPUs available to this instance

## IEF Implementation

IEF implements this plugin using data from Cloud Carbon Footprint. This allows determination of cpu for type of instance in a cloud and can be invoked as part of a model pipeline defined in an `impl`.

Cloud Instance Metadata currently implements only for 'AWS'.

## Usage

In IEF, the model is called from an `impl`. An `impl` is a `.yaml` file that contains configuration metadata and usage inputs. This is interpreted by the command line tool, `impact-engine`. There, the model's `configure` method is called first. The model config shall be empty. Each input is expected to contain `cloud-vendor` and `cloud-instance-type` fields.

You can see example Typescript invocations for each vendor below:

### AWS

```typescript
import {CloudInstanceMetadataModel} from '@grnsft/if-models';

const cimm = new CloudInstanceMetadataModel();
const results = cimm.execute([
  {
    'cloud-vendor': 'aws',
    'cloud-instance-type': 'm5n.large',
  },
]);
```

## Example Impl

The following is an example of how cloud instance metadata can be invoked using an `impl`.

./examples/impls/test/cim.yml

```yaml
name: cloud-instance-metadata
description: example impl invoking Cloud Instance Metadata model
tags:
initialize:
  models:
    - name: cloud-instance-metadata
      model: CloudInstanceMetadataModel
      path: '@grnsft/if-models'
graph:
  children:
    child:
      pipeline:
        - cloud-instance-metadata
      config:
      inputs:
        - timestamp: 2023-07-06T00:00 # [KEYWORD] [NO-SUBFIELDS] time when measurement occurred
          vendor: aws
          instance_type: m5n.large
          duration: 100
          cpu-util: 10
```

Ensure that you have global node_modules bin directory in your $PATH
This impl is run using `impact-engine` using the following command, run from
the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-models
impact-engine --impl ./examples/impls/test/cim.yml --ompl ./ompls/cim.yml
```

This yields a result that looks like the following (saved to `./ompls/cim.yml`):

```yaml
name: cloud-instance-metadata
description: example impl invoking Cloud Instance Metadata model
tags:
initialize:
  models:
    - name: cloud-instance-metadata
      model: CloudInstanceMetadataModel
      path: '@grnsft/if-models'
graph:
  children:
    front-end:
      pipeline:
        - cloud-instance-metadata
      inputs:
        - timestamp: 2023-07-06T00:00
          cloud-vendor: aws
          cloud-instance-type: m5n.large
          duration: 100
          cpu: 10
      outputs:
        - timestamp: 2023-07-06T00:00
          cloud-vendor: aws
          cloud-instance-type: m5n.large
          physical-processor: Intel Xeon Platinum 8259CL
          duration: 100
          cpu: 10
```

You can run this example `impl` by saving it as `./examples/impls/test/cim.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-models
impact-engine --impl ./examples/impls/test/cim.yml --ompl ./examples/ompls/cim.yml
```

The results will be saved to a new `yaml` file in `./examples/ompls`.
