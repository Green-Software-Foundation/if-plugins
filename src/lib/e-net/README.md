# e-net (energy due to networking)

`e-net` simply multiplies the amount of data transferred (GB) by a coefficient (kWh/GB) to yield `energy-network`.

## Parameters

### Model config

Not needed

### Inputs

- `data-in`: inbound data in GB
- `data-out`: outbound data in GB
- `network-energy-coefficient`: coefficient for converting data transferred to energy, in kWh/GB. The default, if no data or invalid data is provided, is 0.001 kWh/GB, taken from [this case study](https://github.com/Green-Software-Foundation/sci-guide/blob/dev/use-case-submissions/msft-eShoppen.md).

## Returns

- `energy-network`: energy used by networking, in kWh

## Calculation

```psuedocode
energy-network = (data_in + data_out) * network-energy-coefficient
```

## Example impl

IEF users will typically call the model as part of a pipeline defined in
an `impl` file.

In this case, instantiating and configuring the model is
handled by `impact-engine` and does not have to be done explicitly by
the user.

The following is an example `impl` that calls `e-net`:

```yaml
name: e-net-demo
description:
tags:
initialize:
  models:
    - name: e-net
      model: ENetModel
      path: '@grnsft/if-models'
graph:
  children:
    child:
      pipeline:
        - e-net
      config:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          data-in: 1
          data-out: 2
          network-energy-coefficient: 0.02
```

You can run this example `impl` by saving it as `examples/impls/test/e-net.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-models
impact-engine --impl ./examples/impls/test/e-net.yml --ompl ./examples/ompls/e-net.yml
```

The results will be saved to a new `yaml` file in `./examples/ompls`.
