# TDP Finder Model

## Scope

The TDP Finder model finds the thermal design power (TDP) of a given processor by looking it up in the model datasets. There are scenarios where the lookup can return multiple possible TDP values. In these cases, we return the maximum of the possible values. There are also cases where no TDP can be found for a specific processor. In these cases, we throw an error. The TDP is then used by other models to calculate the `energy-cpu` value.

## Used DataSets

[./data.csv](./data.csv) Dataset from https://www.kaggle.com/datasets/lincolnzh/cpu-specifications-dataset Licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

[./data2.csv](./data2.csv) Dataset from [Codecarbon](https://github.com/mlco2/codecarbon/blob/master/codecarbon/data/hardware/cpu_power.csv) Licensed under MIT

[./boavizta_data.csv](./boavizta_data.csv) Dataset from Boavizta API [Data Source](https://github.com/Boavizta/boaviztapi/blob/main/boaviztapi/data/crowdsourcing/cpu_specs.csv) Licensed under MIT

## Implementation

IEF implements the plugin based on the logic described above.

## Usage with IMPL

- Model Name: `tdp-finder`

```yaml
name: tdp-demo
description:
tags:
initialize:
  models:
    - name: finder
      model: TdpFinderModel
      path: '@grnsft/if-models'
graph:
  children:
    child:
      pipeline:
        - finder
      inputs:
        - physical-processor: Intel Xeon Platinum 8175M, AMD A8-9600
```

## Output in OMPL

```yaml
name: tdp-demo
description:
tags:
initialize:
  models:
    - name: finder
      model: TdpFinderModel
      path: '@grnsft/if-models'
graph:
  children:
    child:
      pipeline:
        - finder
      inputs:
        - physical-processor: Intel Xeon Platinum 8175M, AMD A8-9600
      outputs:
        - physical-processor: Intel Xeon Platinum 8175M, AMD A8-9600
          thermal-design-power: 150
```

You can run this example `impl` by saving it as `./examples/impls/test/tdp-finder.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-models
impact-engine --impl ./examples/impls/test/tdp-finder.yml --ompl ./examples/ompls/tdp-finder.yml
```

The results will be saved to a new `yaml` file in `./examples/ompls`.
