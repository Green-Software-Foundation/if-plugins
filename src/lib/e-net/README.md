# e-net (energy due to networking)

`e-net` simply multiplies the amount of data transferred (GB) by a coefficient (kWh/GB) to yield `network/energy`.

## Parameters

### Plugin global config

- `energy-per-gb`: coefficient for converting data transferred to energy, in kWh/GB. The default, if no data or invalid data is provided, is 0.001 kWh/GB, taken from [case study 1](https://www.cloudcarbonfootprint.org/docs/methodology/#chosen-coefficient) and [case study 2](https://www.cloudcarbonfootprint.org/docs/methodology/#appendix-iv-recent-networking-studies).

### Inputs

- `network/data-in`: inbound data in GB
- `network/data-out`: outbound data in GB

## Returns

- `network/energy`: energy used by networking, in kWh

## Calculation

```psuedocode
network/energy = (data_in + data_out) * energy-per-gb
```

## Implementation

To run the plugin, you must first create an instance of `ENet`. Then, you can call `execute()` to return `network/energy`.

```typescript
import {ENet} from '@grnsft/if-plugins';

const eNet = ENet({'energy-per-gb': 0.002});
const result = await eNet.execute([
  {
    'network/data-in': 10,
    'network/data-out': 5,
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

The following is an example `manifest` that calls `e-net`:

```yaml
name: e-net-demo
description:
tags:
initialize:
  outputs:
    - yaml
  plugins:
    e-net:
      method: ENet
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

You can run this example `manifest` by saving it as `examples/manifests/test/e-net.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
ie --manifest ./examples/manifests/test/e-net.yml --output ./examples/outputs/e-net.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`.
