# Simple HTML exporter

The `Simple HTML exporter` aims at providing basic (simple) visualization of overall energy and carbon results.
It it includes a template HTML file that renders into 2 charts: `Energy` and `Carbon` over `time`.
Every time the plugin is executed an HTML file is generated based on the template HTML and the `Energy` and `Carbon` values in the input

## Parameters

### Model config

The model should be initialized as follows:

- `html-path`: the path to output (updated) HTML file. If the file already exists it would be overwritten.

### inputs

`energy`[kWh], `carbon`[gCO2] and `timestamp` should be included in the input array items.

## Returns

This plugin acts as a relay, returning the input as-is, with the generated HTML acting as a "side effect".

## Implementation

To run the model, you must first create an instance of `SimpleHtmlExporter` and call its `configure()` method. Then, you can call `execute()` with the proper inputs to generate the HTML.

```typescript
import {SimpleHtmlExporter} from '@grnsft/if-models';
const outputModel = new SimpleHtmlExporter();
await outputModel.configure();
const result = await outputModel.execute([
  {
    ...
    timestamp: '2021-01-01T00:00:00Z',
    energy: 0.00001841,
    carbon: 0.0104062,
    ...
  },
]);
```
## Example impl

```yaml
name: simple-html-exporter-demo
description:
tags:
initialize:
  models:
    - name: simple-html-exporter
      model: SimpleHtmlExporter
      path: "@grnsft/if-models"
graph:
  children:
    child:
      pipeline:
        - simple-html-exporter
      config:
        simple-html-exporter:
          html-path: /usr/local/data/html-export.html
      inputs:
        - timestamp: '2021-01-01T00:00:00Z',
          energy: 0.00001841,
          carbon: 0.0104062,
```


```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-models
impact-engine --impl ./examples/impls/test/simple-html-exporter.yml --ompl ./examples/ompls/simple-html-exporter.yml
```
