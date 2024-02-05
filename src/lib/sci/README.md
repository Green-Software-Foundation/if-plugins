# SCI (software carbon intensity)

[SCI](https://sci-guide.greensoftware.foundation/) is the final value the
framework ultimately aims to return for some component or application.
It represents the amount of carbon emitted per
[functional unit](https://sci-guide.greensoftware.foundation/R/).

## Parameters

### Model config

- `functional-unit`: the functional unit in which to express the carbon impact
- `functional-unit-time`: the time to be used for functional unit conversions, as a string composed of a value and a unit separated with a space, hyphen or underscore, e.g. `2 mins`, `5-days`, `3_years`

### Inputs

either:

- `carbon`: total carbon, i.e. sum of embodied and operational, in gCO2eq

or both of

- `operational-carbon`: carbon emitted during an application's operation in gCO2eq
- `embodied-carbon`: carbon emitted in a component's manufacture
  and disposal in gCO2eq

and:

- `timestamp`: a timestamp for the input
- `duration`: the amount of time, in seconds, that the input covers.
- `functional-unit`: a string describing the functional unit to normalize
  the SCI to. This must match a field provided in the `inputs` with
  an associated value.
- `functional-unit-time`: a time value and a unit as a single string.
  E.g. `3 s`, `5 seconds`, `0.5 days`, ` 0.1 months`, `5 y`

## Returns

- `carbon`: the total carbon, calculated as the sum of `operational-carbon`
  and `embodied-carbon`, in gCO2eq
- `sci`: carbon expressed in terms of the given functional unit

## Calculation

SCI is calculated as:

```pseudocode
sci = operational-carbon + embodied-carbon / functional unit
```

where `operational-carbon` is the product of `energy` and `grid-intensity`.
The SCI-guide represents this as

```pseudocode
SCI = (E * I) + M per R
```

where
`E` = energy used in kWh,
`I` is grid intensity in gCO2e/kWh,
`M` is embodied carbon, and
`R` is the functional unit.

SCI is the sum of the `operational-carbon` (calculated using the `sci-o` model)
and the `embodied-carbon` (calculated using the `sci-m` model).
It is then converted to some functional unit, for example for an API the
functional unit might be per request, or for a website
it might be per 1000 visits.

## IEF Implementation

`sci` takes `operational-carbon` and `embodied-carbon` as inputs along
with two parameters related to the functional unit:

- `functional-unit`: a string describing the functional unit to normalize
  the SCI to. This must match a field provided in the `inputs` with
  an associated value.
  For example, if `functional-unit` is `"requests"` then there should be
  a `requests` field in `inputs` with an associated value for
  the number of requests per `functional-unit`.
- `functional-unit-time`: a time value and a unit as a single string.
  E.g. `2 s`, `10 seconds`, `3 days`, `2 months`, `0.5 y`.

In a model pipeline, time is always denominated in `seconds`. It is only in
`sci` that other units of time are considered. Therefore, if `functional-unit-time`
is `1 month`, then the sum of `operational-carbon` and `embodied-carbon` is
multiplied by the number of seconds in one month.

Example:

```yaml
operational-carbon: 0.02  // operational-carbon per s
embodied-carbon: 5   // embodied-carbon per s
functional-unit: requests  // indicate the functional unit is requests
functional-unit-time: 1 minute  // time unit is minutes
requests: 100   // requests per minute
```

```pseduocode
sci-per-s = operational-carbon + embodied-carbon / duration  // (= 5.02)
sci-per-minute = sci-per-s * 60  // (= 301.2)
sci-per-functional-unit-time = sci-per-minute * number of minutes
sci-per-f-unit = sci-per-functional-unit-time / 100  // (= 3.012 gC/request)
```

To run the model, you must first create an instance of `SciModel` and call
its `configure()` method. Then, you can call `execute()` to return `sci`.

```typescript
import {SciModel} from '@grnsft/if-models';

const sciModel = new SciModel();
sciModel.configure('name', {
  'functional-unit-time': '1 day',
  'functional-unit': 'requests',
});
const results = sciModel.execute([
  {
    'operational-carbon': 0.02,
    'embodied-carbon': 5,
    duration: 1,
    requests: 100,
  },
]);
```

## Example impl

IEF users will typically call the model as part of a pipeline defined in an `impl`
file. In this case, instantiating and configuring the model is handled by
`impact-engine` and does not have to be done explicitly by the user.
The following is an example `impl` that calls `sci`:

```yaml
name: sci-demo
description: example invoking sci model
tags:
initialize:
  models:
    - name: sci
      model: SciModel
      path: '@grnsft/if-models'
graph:
  children:
    child:
      pipeline:
        - sci
      config:
        sci:
          functional-unit-duration: 1
          functional-unit-time: '5 minutes'
      inputs:
        - timestamp: 2023-07-06T00:00
          operational-carbon: 0.02
          embodied-carbon: 5
          duration: 1
          requests: 100
```

You can run this example `impl` by saving it as `./examples/impls/test/sci.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
npm i -g @grnsft/if-models
impact-engine --impl ./examples/impls/test/sci.yml --ompl ./examples/ompls/sci.yml
```

The results will be saved to a new `yaml` file in `./examples/ompls`.
