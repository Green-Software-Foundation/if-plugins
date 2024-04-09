# E-MEM (energy due to memory)

`e-mem` simply multiples the amount of memory being used by a energy-per-gb
(0.000392 kWh/GB) to yield `memory/energy`.

## Parameters

### Plugin global config

- `energy-per-gb`: a coefficient for energy in kWh per GB. If not provided,
  defaults to 0.000392 (optional), take from [this case study](https://www.cloudcarbonfootprint.org/docs/methodology/#memory)

### Inputs

- `memory/utilization`: percentage of the total available memory being used in the input period
- `memory/capacity`: the total amount of memory available, in GB

## Returns

- `memory/energy`: energy used by memory, in kWh

## Calculation

```psuedocode
memory/energy = (('memory/utilization'/100) * 'memory/capacity') * mem-energy
```

## Implementation

To run the plugin, you must first create an instance of `EMem`. Then, you can call `execute()` to return `memory/energy`.

```typescript
import {EMem} from '@grnsft/if-plugins';

const eMem = EMem({'energy-per-gb': 0.002});
const result = await eMem.execute([
  {
    'memory/utilization': 80,
    'memory/capacity': 16,
    duration: 3600,
    timestamp: '2022-01-01T01:00:00Z',
  },
]);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in
a `manifest` file.

In this case, instantiating and configuring the plugin is
handled by `ie` and does not have to be done explicitly by
the user.

The following is an example `manifest` that calls `e-mem`:

```yaml
name: e-mem-demo
description:
tags:
initialize:
  outputs:
    - yaml
  plugins:
    e-mem:
      method: EMem
      path: '@grnsft/if-plugins'
      global-config:
        energy-per-gb: 0.002
tree:
  children:
    child:
      pipeline:
        - e-mem
      config:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          memory/utilization: 40
          memory/capacity: 1
```

You can run this example `manifest` by saving it as `examples/manifests/test/e-mem.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
ie --manifest ./examples/manifests/test/e-mem.yml --output ./examples/outputs/e-mem.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`.
