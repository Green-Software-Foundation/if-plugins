# CSV Export

# Parameters

## Configuration

Required fields:

- `output-path`: The full file path to write the exported csv file.

Optional fields:

- `headers`: A list of headers to extract from the inputs to write as columns in the csv file. An empty list of headers will write all fields provided as inputs to the ModelParams. 
 The default list of headers is empty therefore all input data will be written to the csv file. 

## Inputs

The inputs should be in the standard format provided by the IF project. 

## Outputs

This model will write externally to disk as csv file and pass the inputs directly as output. 

## Implementation

To run the model, you must first create an instance of `CsvExportModel` and call its `configure()` method. Then, you can call `execute()` with the desired input

```typescript
import {CsvExportModel} from '@grnsft/if-models';
const outputModel = new CsvExportModel();
await outputModel.configure();
const result = await outputModel.execute([
  {
    timestamp: 2023-07-06T00:00
    duration: 1
    operational-carbon: 0.02
    embodied-carbon: 5
    energy: 3.5
    carbon: 5.02
  },
]);
```

## Example impl

IEF users will typically call the model as part of a pipeline defined in an `impl`
file. In this case, instantiating and configuring the model is handled by
`impact-engine` and does not have to be done explicitly by the user.
The following is an example `impl` that calls `sci`:

```yaml
name: csv-export-demo
description: example exporting output to a csv file
tags:
initialize:
  models:
    - name: csv-exporter
      model: CsvExportModel
      path: "@grnsft/if-models"
graph:
  children:
    child:
      pipeline:
        - sci
      config:
        csv-exporter:
          output-path: C:/dev/csv-export.csv
          headers:
            - timestamp
            - duration
            - carbon
            - energy
      inputs:
        - timestamp: 2023-07-06T00:00
          duration: 1
          operational-carbon: 0.02
          embodied-carbon: 5
          energy: 3.5
          carbon: 5.02
        - timestamp: 2023-07-06T00:10
          duration: 1
          operational-carbon: 0.03
          embodied-carbon: 4
          energy: 2.9
          carbon: 4.03
```