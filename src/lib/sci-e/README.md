# SCI-E (total energy)

`sci-e` is a plugin that simply sums up the contributions to a component's
energy use. The plugin returns `energy` which is used as the input to
the `sci-o` plugin that calculates operational emissions for the component.

## Plugin name

IF recognizes the SCI-E plugin as `sci-e`

## Parameters

### Plugin config

Not Needed

### Inputs

At least one of:

- `energy-cpu`: energy used by the CPU, in kWh
- `energy-memory`: energy used by memory, in kWh
- `energy-gpu`: energy used by GPU, in kWh
- `energy-network`: energy used to handle network traffic, in kWh

plus the following required:

- `timestamp`: a timestamp for the input
- `duration`: the amount of time, in seconds, that the input covers.

## Returns

- `energy`: the sum of all energy components, in kWh

## Calculation

`energy` is calculated as the sum of the energy due to CPU usage, energy due
to network traffic, energy due to memory and energy due to GPU usage.

```pseudocode
energy = energy-cpu + energy-network + energy-memory + e-gpu
```

In any plugin pipeline that includes `sci-o`, `sci-o` must be preceded by `sci-e`.
This is because `sci-o` does not recognize the individual contributions,
`energy-cpu`, `energy-network`, etc, but expects to find `energy`.
Only `sci-e` takes individual contributions and returns `energy`.

## Implementation

To run the plugin, you must first create an instance of `SciE`. Then, you can call `execute()` to return `energy`.

```typescript
import { SciE } from '@gsf/if-plugins';

const sciE = SciE();
const result = sciE.execute([
  {
    energy-cpu: 0.001,
    energy-memory: 0.0005,
    energy-network: 0.0005,
  }
])
```

## Example impl

IF users will typically call the plugin as part of a pipeline defined in an `impl` file. In this case, instantiating the plugin is handled by `if` and does not have to be done explicitly by the user. The following is an example `impl` that calls `sci-e`:

```yaml
name: sci-e-demo
description:
tags:
initialize:
  plugins:
    - sci-e
      function: SciE
      path: '@grnsft/if-plugins'
graph:
  children:
    child:
      pipeline:
        - sci-e
      config:
        sci-e:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          energy-cpu: 0.001
```

You can run this example `impl` by saving it as `./examples/impls/test/sci-e.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
if --impl ./examples/impls/test/sci-e.yml --ompl ./examples/ompls/sci-e.yml
```

The results will be saved to a new `yaml` file in `./examples/ompls`.
