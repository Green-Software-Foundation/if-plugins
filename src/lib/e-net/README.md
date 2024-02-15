# e-net (energy due to networking)

`e-net` simply multiplies the amount of data transferred (GB) by a coefficient (kWh/GB) to yield `energy-network`.

## Parameters

### Plugin global config

- `energy-per-gb`: coefficient for converting data transferred to energy, in kWh/GB. The default, if no data or invalid data is provided, is 0.001 kWh/GB, taken from [this case study](https://github.com/Green-Software-Foundation/sci-guide/blob/dev/use-case-submissions/msft-eShoppen.md).

### Inputs

- `network/data-in`: inbound data in GB
- `network/data-out`: outbound data in GB

## Returns

- `energy-network`: energy used by networking, in kWh

## Calculation

```psuedocode
energy-network = (data_in + data_out) * energy-per-gb
```

## Example impl

IEF users will typically call the plugin as part of a pipeline defined in
an `impl` file.

In this case, instantiating and configuring the plugin is
handled by `if` and does not have to be done explicitly by
the user.

The following is an example `impl` that calls `e-net`:

```yaml
name: e-net-demo
description:
tags:
initialize:
  plugins:
    e-net:
      function: ENet
      path: '@grnsft/if-plugins'
      global-config:
        energy-per-gb: 0.02
tree:
  children:
    child:
      pipeline:
        - e-net
      config:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          network/data-in: 1
          network/data-out: 2
```

You can run this example `impl` by saving it as `examples/impls/test/e-net.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
if --impl ./examples/impls/test/e-net.yml --ompl ./examples/ompls/e-net.yml
```

The results will be saved to a new `yaml` file in `./examples/ompls`.
