# Regex

`regex` is a generic plugin to match part of one string in an `input` and extract it into an output.

You provide the name of the value you want to match, and a name to use to add the regex to the output array.

For example, `boavizta-cpu` need `cpu/name` to work, however `cloud-metadata` returns `physical-processor` which usually contains a long string of processors that the instance could be separated by `,`, like so:

```
Intel® Xeon® Platinum 8272CL,Intel® Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz,Intel® Xeon® E5-2673 v3 2.4 GHz
```

## Parameters

### Plugin config

- `parameter` - a parameter by a specific configured string
- `match` - a regex by which needs to match the `parameter`
- `output` - output parameter name in the input

### Inputs

- `parameter` - as input parameter, must be available in the input array

## Returns

- `output`: the fisrt match of `parameter` with the parameter name with `match` defined in global config.

## Implementation

To run the plugin, you must first create an instance of `Regex`. Then, you can call `execute()`.

```typescript
import {Regex} from '@grnsft/if-plugins';

const globalConfig = {
  parameter: 'physical-processor',
  match: '^[^,]+',
  output: 'cpu/name',
};
const regex = Regex(globalConfig);

const input = [
  {
    timestamp: '2021-01-01T00:00:00Z',
    duration: 3600,
    'physical-processor':
      'Intel® Xeon® Platinum 8272CL,Intel® Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz,Intel® Xeon® E5-2673 v3 2.4 GHz',
  },
];
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by `if` and does not have to be done explicitly by the user. The following is an example manifest that calls `regex`:

```yaml
name: regex-demo
description:
tags:
initialize:
  outputs:
    - yaml
  plugins:
    regex:
      method: Regex
      path: '@grnsft/if-plugins'
      global-config:
        parameter: physical-processor
        match: ^[^,]+
        output: cpu/name
tree:
  children:
    child:
      pipeline:
        - regex
      config:
        regex:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          physical-processor: Intel® Xeon® Platinum 8272CL,Intel® Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz,Intel® Xeon® E5-2673 v3 2.4 GHz
```

You can run this example by saving it as `./examples/manifests/test/regex.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
if --manifest ./examples/manifests/test/regex.yml --output ./examples/outputs/regex.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`.
