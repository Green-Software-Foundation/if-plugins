# Grafana Exporter

Grafana exporter is a modified csv exporter that outputs csv data in a format that works well with our Grafana dashboard.

# Parameters

## Plugin config

Required fields:

- `output-path`: The full file path to write the exported csv file.

Optional fields:

- `headers`: A list of headers to extract from the inputs to write as columns in the csv file. An empty list of headers will write all fields provided as inputs to the `pluginParams`. The default list of headers is empty therefore all input data will be written to the csv file.

## Inputs

The inputs should be in the standard format provided by the IF project.

## Outputs

This plugin will write externally to disk as csv file and pass the inputs directly as output.

## Implementation

To run the plugin, you must first create an instance of `CsvExport` and call its `execute()` function with the desired inputs

```typescript
import {GrafanaExport} from '@grnsft/if-plugins';
const output = GrafanaExport();
const result = await output.execute([
  {
    timestamp: '2023-07-06T00:00',
    duration: 1,
    'operational-carbon': 0.02,
    'carbon-embodied': 5,
    energy: 3.5,
    carbon: 5.02,
  },
]);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a `manifest`
file. In this case, instantiating the plugin is handled by
`ie` and does not have to be done explicitly by the user.

The following is an example `manifest` that runs `grafana-export.yml`:

```yaml
name: grafana-export-demo
description: example exporting output to a csv file
tags:
initialize:
  outputs:
    - yaml
  plugins:
    grafana-exporter:
      method: GrafanaExport
      path: '@grnsft/if-plugins'
tree:
  children:
    child:
      pipeline:
        - grafana-exporter
      config:
        grafana-exporter:
          output-path: C:/dev/grafana-export.csv
          headers:
            - timestamp
            - duration
            - carbon
            - energy
      inputs:
        - timestamp: 2023-07-06T00:00
          duration: 1
          carbon-operational: 0.02
          carbon-embodied: 5
          energy: 3.5
          carbon: 5.02
        - timestamp: 2023-07-06T00:10
          duration: 1
          operational-carbon: 0.03
          carbon-embodied: 4
          energy: 2.9
          carbon: 4.03
```

You can run this example `manifest` by saving it as `./examples/manifests/test/grafana-export.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-plugins
ie --manifest ./examples/manifests/test/grafana-export.yml --output ./examples/outputs/grafana-export
```

The results will be saved into the `output-path`.
