# SCI-M: embodied carbon

Software systems cause emissions through the hardware that they operate on, both through the energy that the physical hardware consumes and the emissions associated with manufacturing the hardware. Embodied carbon refers to the carbon emitted during the manufacture and eventual disposal of a component. It is added to the operational carbon (carbon emitted when a component is used) to give an overall SCI score.

Read more on [embodied carbon](https://github.com/Green-Software-Foundation/sci/blob/main/Software_Carbon_Intensity/Software_Carbon_Intensity_Specification.md#embodied-emissions)

## Parameters

### Plugin config

N/A

### Inputs

- `device/emissions-embodied`: the sum of Life Cycle Assessment (LCA) emissions for the component
- `device/expected-lifespan`: the length of time, in seconds, between a component's manufacture and its disposal
- `resources-reserved`: the number of resources reserved for use by the software
- `resources-total`: the total number of resources available
- `duration`: the amount of time covered by an observation, in this context it is used as the share of the total life span of the hardware reserved for use by an application, in seconds.

> Note that if you have a plugin pipeline that adds `vcpus-allocated` and `vcpus-total` to each observation, such as the `cloud-instance-metadata` plugin, those values will be used **in preference** to the given `resources-reserved` and `resources-total` fields.

## Returns

- `carbon-embodied`: the carbon emitted in manufacturing and disposing of a component, in gCO2eq

## Calculation

To calculate the embodied carbon, `m` for a software application, use the equation:

```
m = te * ts * rs
```

Where:

- `device/emissions-embodied` = Total embodied emissions; the sum of Life Cycle Assessment (LCA) emissions for the component.

- `timeShare` = Time-share; the share of the total life span of the hardware reserved for use by an application.

  - `timeShare` is calculated as `duration/'device/expected-lifespan'`, where:
    - `duration` = the length of time the hardware is reserved for use by the software.
    - `device/expected-lifespan` = Expected lifespan: the length of time, in seconds, between a component's manufacture and its disposal.

- `resourceShare` = Resource-share; the share of the total available resources of the hardware reserved for use by an application.
  - `resourceShare` is calculated as `resources-reserved/resources-total`, where:
    - `resources-reserved` = Resources reserved; the number of resources reserved for use by the software.
    - `resources-total` = Total Resources; the total number of resources available.

## Implementation

IEF implements the plugin based on the logic described above. To run the plugin, you must first create an instance of `SciM` method. Then, you can call `execute()` to return `m`.

## Usage

The following snippet demonstrates how to call the `sci-m` plugin from Typescript.

```typescript
import {SciM} from '@grnsft/if-plugins';

const sciM = SciM();
const results = sciM.execute([
  {
    'device/emissions-embodied': 200, // in gCO2e for total resource units
    duration: 60 * 60 * 24 * 30, // time reserved in seconds, can point to another field "duration"
    'device/expected-lifespan': 60 * 60 * 24 * 365 * 4, // lifespan in seconds (4 years)
    'resources-reserved': 1, // resource units reserved / used
    'resources-total': 1, // total resource units available
  },
]);
```

## Example manifest

IEF users will typically call the plugin as part of a pipeline defined in a `manifest` file. In this case, instantiating the plugin is handled by `if` and does not have to be done explicitly by the user. The following is an example `manifest` that calls `sci-m`:

```yaml
name: sci-m
description: simple demo invoking sci-m
tags:
initialize:
  plugins:
    sci-m:
      method: SciM
      path: '@grnsft/if-plugins'
tree:
  children:
    child:
      pipeline:
        - sci-m # duration & config -> embodied
      defaults:
        device/emissions-embodied: 1533.120 # gCO2eq
        device/expected-lifespan: 3 # 3 years in seconds
        resources-reserved: 1
        resources-total: 8
      inputs:
        - timestamp: 2023-07-06T00:00
          duration: 3600
```

You can run this example `manifest` by executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
if --manifest ./examples/manifests/test/sci-m.yml --output ./examples/outputs/sci-m.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`.
