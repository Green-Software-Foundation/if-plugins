# SCI-M: embodied carbon

Software systems cause emissions through the hardware that they operate on, both through the energy that the physical hardware consumes and the emissions associated with manufacturing the hardware. Embodied carbon refers to the carbon emitted during the manufacture and eventual disposal of a component. It is added to the operational carbon (carbon emitted when a component is used) to give an overall SCI score.

Read more on [embodied carbon](https://github.com/Green-Software-Foundation/sci/blob/main/Software_Carbon_Intensity/Software_Carbon_Intensity_Specification.md#embodied-emissions)

## Parameters

### Plugin config

- `total-embodied-emissions`: the sum of Life Cycle Assessment (LCA) emissions for the component
- `expected-lifespan`: the length of time, in seconds, between a component's manufacture and its disposal
- `reserved-resources`: the number of resources reserved for use by the software
- `total-resources`: the total number of resources available

> Note that if you have a plugin pipeline that adds `vcpus-allocated` and `vcpus-total` to each observation, such as the `cloud-instance-metadata` plugin, those values will be used **in preference** to the given `reserved-resources` and `total-resources` fields.

### Inputs

- `timestamp`: a timestamp for the input
- `duration`: the amount of time covered by an observation, in this context it is used as the share of the total life span of the hardware reserved for use by an application, in seconds.

## Returns

- `embodied-carbon`: the carbon emitted in manufacturing and disposing of a component, in gCO2eq

## Calculation

To calculate the embodied carbon, `m` for a software application, use the equation:

```
m = te * ts * rs
```

Where:

- `total-embodied-emissions` = Total embodied emissions; the sum of Life Cycle Assessment (LCA) emissions for the component.

- `timeShare` = Time-share; the share of the total life span of the hardware reserved for use by an application.

  - `timeShare` is calculated as `duration/expected-lifespan`, where:
    - `duration` = the length of time the hardware is reserved for use by the software.
    - `expected-lifespan` = Expected lifespan: the length of time, in seconds, between a component's manufacture and its disposal.

- `resourceShare` = Resource-share; the share of the total available resources of the hardware reserved for use by an application.
  - `resourceShare` is calculated as `resources-reserved/total-resources`, where:
    - `resources-reserved` = Resources reserved; the number of resources reserved for use by the software.
    - `total-resources` = Total Resources; the total number of resources available.

## Implementation

IEF implements the plugin based on the logic described above. To run the plugin, you must first create an instance of `SciMM` method. Then, you can call `execute()` to return `m`.

## Usage

The following snippet demonstrates how to call the `sci-m` plugin from Typescript.

```typescript
import {SciM} from '@grnsft/if-plugins';

const sciM = SciM();
const results = sciM.execute([
  {
    'total-embodied-emissions': 200, // in gCO2e for total resource units
    duration: 60 * 60 * 24 * 30, // time reserved in seconds, can point to another field "duration"
    'expected-lifespan': 60 * 60 * 24 * 365 * 4, // lifespan in seconds (4 years)
    'resources-reserved': 1, // resource units reserved / used
    'total-resources': 1, // total resource units available
  },
]);
```

## Example impl

IEF users will typically call the plugin as part of a pipeline defined in an `impl` file. In this case, instantiating the plugin is handled by `impact-engine` and does not have to be done explicitly by the user. The following is an example `impl` that calls `sci-m`:

```yaml
name: sci-m
description: simple demo invoking sci-m
tags:
initialize:
  plugins:
    - sci-m
      function: SciM
      path: '@grnsft/if-plugins'
graph:
  children:
    child:
      pipeline:
        - sci-m # duration & config -> embodied
      config:
        sci-m:
          total-embodied-emissions: 1533.120 # gCO2eq
          expected-lifespan: 3 # 3 years in seconds
          resources-reserved: 1
          total-resources: 8
      inputs:
        - timestamp: 2023-07-06T00:00
          duration: 3600
```

You can run this example `impl` by executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
impact-engine --impl ./examples/impls/test/sci-m.yml --ompl ./examples/ompls/sci-m.yml
```

The results will be saved to a new `yaml` file in `./examples/ompls`.
