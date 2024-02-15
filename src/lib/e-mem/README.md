# E-MEM (energy due to memory)

`e-mem` simply multiples the amount of memory being used by a energy-per-gb
(0.38 kWh/GB) to yield `energy-memory`.

## Parameters

### Plugin global config

- `energy-per-gb`: a coefficient for energy in kWh per GB. If not provided,
  defaults to 0.38. (optional)

### Inputs

- `memory/utilization`: percentage of the total available memory being used in the input period
- `memory/capacity`: the total amount of memory available, in GB

## Returns

- `energy-memory`: energy used by memory, in kWh

## Calculation

```psuedocode
energy-memory = (('memory/utilization'/100) * 'memory/capacity') * mem-energy
```

## Example impl

IEF users will typically call the plugin as part of a pipeline defined in
an `impl` file.

In this case, instantiating and configuring the plugin is
handled by `if` and does not have to be done explicitly by
the user.

The following is an example `impl` that calls `sci-e`:

```yaml
name: e-mem-demo
description:
tags:
initialize:
  plugins:
    e-mem:
      function: EMem
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

You can run this example `impl` by saving it as `examples/impls/test/e-mem.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
if --impl ./examples/impls/test/e-mem.yml --ompl ./examples/ompls/e-mem.yml
```

The results will be saved to a new `yaml` file in `./examples/ompls`.
