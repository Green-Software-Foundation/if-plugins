# E-MEM (energy due to memory)

`e-mem` simply multiples the amount of memory being used by a coefficient
(0.38 kWh/GB) to yield `energy-memory`.

## Parameters

### Model config

Not Needed

### Inputs

- `mem-util`: percentage of the total available memory being used in the input period
- `total-memoryGB`: the total amount of memory available, in GB

optional:

- `coefficient`: a coefficient for energy in kWh per GB. If not provided,
  defaults to 0.38.

## Returns

- `energy-memory`: energy used by memory, in kWh

## Calculation

```psuedocode
energy-memory = ((memory_util/100) * total-memoryGB) * mem-energy
```

## Example impl

IEF users will typically call the model as part of a pipeline defined in
an `impl` file.

In this case, instantiating and configuring the model is
handled by `impact-engine` and does not have to be done explicitly by
the user.

The following is an example `impl` that calls `sci-e`:

```yaml
name: e-mem-demo
description:
tags:
initialize:
  models:
    - name: e-mem
      model: EMemModel
      path: '@grnsft/if-models'
graph:
  children:
    child:
      pipeline:
        - e-mem
      config:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          mem-util: 40
          total-memoryGB: 1
```

You can run this example `impl` by saving it as `examples/impls/e-mem.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-models
impact-engine --impl ./examples/impls/test/e-mem.yml --ompl ./examples/ompls/e-mem.yml
```

The results will be saved to a new `yaml` file in `./examples/ompls`.
