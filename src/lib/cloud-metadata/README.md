# Cloud Metadata

This plugin allows you to determine an instance's physical processor and thermal design power based on its instance name.

## Parameters

## Plugin Config

- `fields`: An array of parameters that should be output (optional)

### Inputs

- `timestamp`: ISO 8061 string,
- `duration`: number of seconds the observation spans,
- `cloud/vendor`: the cloud platform provider, e.g. `aws`
- `cloud/instance-type`: the name of the specific instance being used, e.g. `m5n.large`

## Returns

An array containing:

- `timestamp`: "2023-07-06T00:01"
- `duration`: 10
- `cloud/vendor`: the name of the cloud vendor as a string, options are "azure", "gcp" or "aws"
- `cloud/instance-type`: name of the instance type as a string, e.g. "m5n.large"
- `vcpus-allocated`: number of vCPUs allocated to this instance
- `vcpus-total`: total number of vCPUs available to this instance
- `memory-available`: total memory available on this instance, in GB,
- `physical-processor`: name of the physical processor used by this instance as a string, e.g. "Intel® Xeon® Platinum 8259CL" (note some instances return multiple possible processors separated by commas)
- `cpu/thermal-design-power`: the thermal design power of the given processor (selects the first in the list of multiple are returned)

## IF Implementation

IF implements this plugin using data from Cloud Carbon Footprint. This allows determination of cpu for type of instance in a cloud and can be invoked as part of a plugin pipeline defined in a `manifest`.

Note that "gcp" data are not yet available in our implementation.

## Usage

In IF, the plugin is called from a `manifest`. A `manifest` is a `.yaml` file that contains configuration metadata and usage inputs. This is interpreted by the command line tool, `ie`. The plugin config shall be empty. Each input is expected to contain `cloud/vendor` and `cloud/instance-type` fields.

You can see example Typescript invocations for each vendor below:

### AWS

```typescript
import {CloudMetadata} from '@grnsft/if-plugins';

const cloudMetadata = CloudMetadata();
const result = await cloudMetadata.execute([
  {
    'cloud/vendor': 'aws',
    'cloud/instance-type': 'm5n.large',
  },
]);
```

## Example Manifest

The following is an example of how cloud metadata can be invoked using a `manifest`.

./examples/manifests/test/cloud-metadata.yml

```yaml
name: cloud-metadata
description: example manifest invoking Cloud Metadata plugin
tags:
initialize:
  outputs:
    - yaml
  plugins:
    cloud-metadata:
      method: CloudMetadata
      path: '@grnsft/if-plugins'
tree:
  children:
    child:
      pipeline:
        - cloud-metadata
      config:
        cloud-metadata:
          fields:
            - cpu/thermal-design-power
            - physical-processor
            - memory-available
      inputs:
        - timestamp: 2023-07-06T00:00 # [KEYWORD] [NO-SUBFIELDS] time when measurement occurred
          cloud/vendor: aws
          cloud/instance-type: m5n.large
          duration: 100
```

Ensure that you have global node_modules bin directory in your $PATH
This manifest is run using `ie` using the following command, run from
the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
ie --manifest ./examples/manifests/test/cloud-metadata.yml --output ./outputs/cloud-metadata.yml
```

This yields a result that looks like the following (saved to `./outputs/cloud-metadata.yml`):

```yaml
name: cloud-metadata
description: example manifest invoking Cloud Metadata plugin
tags:
initialize:
  outputs:
    - yaml
  plugins:
    cloud-metadata:
      method: CloudMetadata
      path: '@grnsft/if-plugins'
tree:
  children:
    front-end:
      pipeline:
        - cloud-metadata
      config:
        cloud-metadata:
          fields:
            - cpu/thermal-design-power
            - physical-processor
            - memory-available
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
          vcpus-allocated: 2
          vcpus-total: 96
          memory-available: 8
          physical-processor: "Intel® Xeon® Platinum 8259CL",
          cpu/thermal-design-power: 210
```

You can run this example `manifest` by saving it as `./examples/manifests/test/cloud-metadata.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
ie --manifest ./examples/manifests/test/cloud-metadata.yml --output ./examples/outputs/cloud-metadata
```

The results will be saved to a new `yaml` file in `./examples/outputs`.
