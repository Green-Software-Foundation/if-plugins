# Cloud Instance Metadata

This plugin allows you to determine an instance's physical processor and thermal design power based on its instance name.

## Parameters

## Plugin Config

Not Needed

### Inputs

- `cloud/vendor`: the cloud platform provider, e.g. `aws`
- `cloud/instance-type`: the name of the specific instance being used, e.g. `m5n.large`

## Returns

An array containing:

- `cloud/instance-type`: echo input `instance-type`
- `cloud/vendor`: echo input `vendor`
- `physical-processor`: physical processor used in the given instance
- `vcpus-allocated`: number of vCPUs allocated to this instance
- `vcpus-total`: total number of vCPUs available to this instance

## IEF Implementation

IEF implements this plugin using data from Cloud Carbon Footprint. This allows determination of cpu for type of instance in a cloud and can be invoked as part of a plugin pipeline defined in a `manifest`.

Cloud Instance Metadata currently implements only for 'AWS'.

## Usage

In IEF, the plugin is called from a `manifest`. A `manifest` is a `.yaml` file that contains configuration metadata and usage inputs. This is interpreted by the command line tool, `ie`. The plugin config shall be empty. Each input is expected to contain `cloud/vendor` and `cloud/instance-type` fields.

You can see example Typescript invocations for each vendor below:

### AWS

```typescript
import {CloudInstanceMetadata} from '@grnsft/if-plugins';

const cim = CloudInstanceMetadata();
const result = await cim.execute([
  {
    'cloud/vendor': 'aws',
    'cloud/instance-type': 'm5n.large',
  },
]);
```

## Example Manifest

The following is an example of how cloud instance metadata can be invoked using a `manifest`.

./examples/manifests/test/cim.yml

```yaml
name: cloud-instance-metadata
description: example manifest invoking Cloud Instance Metadata plugin
tags:
initialize:
  plugins:
    cloud-instance-metadata:
      method: CloudInstanceMetadata
      path: '@grnsft/if-plugins'
tree:
  children:
    child:
      pipeline:
        - cloud-instance-metadata
      config:
      inputs:
        - timestamp: 2023-07-06T00:00 # [KEYWORD] [NO-SUBFIELDS] time when measurement occurred
          cloud/vendor: aws
          cloud/instance-type: m5n.large
          duration: 100
          cpu/utilization: 10
```

Ensure that you have global node_modules bin directory in your $PATH
This manifest is run using `ie` using the following command, run from
the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
ie --manifest ./examples/manifests/test/cim.yml --output ./outputs/cim.yml
```

This yields a result that looks like the following (saved to `./outputs/cim.yml`):

```yaml
name: cloud-instance-metadata
description: example manifest invoking Cloud Instance Metadata plugin
tags:
initialize:
  plugins:
    cloud-instance-metadata:
      method: CloudInstanceMetadata
      path: '@grnsft/if-plugins'
tree:
  children:
    front-end:
      pipeline:
        - cloud-instance-metadata
      inputs:
        - timestamp: 2023-07-06T00:00
          cloud/vendor: aws
          cloud/instance-type: m5n.large
          duration: 100
          cpu/utilization: 10
      outputs:
        - timestamp: 2023-07-06T00:00
          cloud/vendor: aws
          cloud/instance-type: m5n.large
          duration: 100
          cpu/utilization: 10
          vcpus-allocated: 2
          vcpus-total: 96
          memory-available: 8
          physical-processor: "Intel® Xeon® Platinum 8259CL",
          cpu/thermal-design-power: 210
```

You can run this example `manifest` by saving it as `./examples/manifests/test/cim.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
ie --manifest ./examples/manifests/test/cim.yml --output ./examples/outputs/cim.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`.
