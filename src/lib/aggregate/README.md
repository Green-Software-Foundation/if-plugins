# Aggregate

The `aggregate` method aggregates impact metrics across all observations for a single graph node.
The default aggregation method is `sum`. In this case, the impacts in each observation are summed to calculate an aggregate metric whch is added to the output data.
You can also configure `aggregate` to provide the average (mean) impact across the observations instead of the sum.


## Parameters

### Model config

No global config

### Inputs

- `aggregation-metrics`: An array of strings, where each string is an impact metric to aggregate, e.g. `carbon`. The given impact metrics must exist in the input data, or the model will throw an exception.
- `aggregation-method`: method to use to aggregate impacts. The default is `sum`, but you can also provide `avg` to calculate the mean impact.


## Returns

- `aggregate-<impact-metric>`: the aggregated value for each impact metric in `aggregation-metrics`, e.g. `aggregate-carbon`.

## Calculation

When the `aggregation-method` is `sum`, the calculation for each metric is:

```pseudocode
for impact in input data:
    aggregate += impact
```

## Example impl

IEF users will typically call the model as part of a pipeline defined in an `impl` file. `Aggregate` has to be explicitly added to the pipeline for **every node** you want it to operate on.

The following is an example `impl` that calls `aggregate` in a pipeline:

```yaml
name: aggregate-demo
description:
tags:
initialize:
  models:
    - name: teads-curve
      model: TeadsCurveModel
      path: '@grnsft/if-unofficial-models'
    - name: sci-e
      model: SciEModel
      path: '@grnsft/if-models'
    - name: sci-o
      model: SciOModel
      path: '@grnsft/if-models'
    - name: sci-m
      model: SciMModel
      path: '@grnsft/if-models'
    - name: aggregate
      model: AggregateModel
      path: '@grnsft/if-models'
graph:
  children:
    child:
      pipeline:
        - teads-curve
        - sci-e
        - sci-o
        - sci-m
        - aggregate
      config:
        aggregate:
            aggregate-metrics: ['carbon', 'energy']
            aggregate-method: 'sum'
        sci-m:
            total-embodied-emissions: 1533.120 # gCO2eq
            expected-lifespan: 3 # 3 years in seconds
            resources-reserved: 1
            total-resources: 8
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          cpu-util: 30
          thermal-design-power: 65
```

You can run this example `impl` by saving it as `examples/impls/e-mem.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-models
impact-engine --impl ./examples/impls/aggregate.yml --ompl ./examples/ompls/aggregate.yml
```

The results will be saved to a new `yaml` file in `./examples/ompls`.