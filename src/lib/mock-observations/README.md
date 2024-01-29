# Mock Observations Model

## Introduction

A model for mocking observations (inputs) for testing and demo purposes

## Scope

The mode currently mocks 2 types of observation data:

- Common key-value pairs, that are generated statically and are the same for each generated observation/input (see 'helpers/CommonGenerator.ts')
- Randomly generated integer values for predefined keys (see 'helpers/RandIntGenerator.ts')

## Implementation

The model's 'config' section in the impl file determines its behaviour.
('inputs' section is ignored).
Config section will have the the following fields (see example below):

```yaml
timestamp-from
timestamp-to
duration
components
generators
```

- **timestamp-from**, **timestamp-to** and **duration** define time buckets for which to generate observations.
- **generators** define which fields to generate for each observations
- **components** define the components for which to generate observations for. The observations generated according to **timestamp-from**, **timestamp-to**, **duration** and **generators** will be duplicated for each component.
  All generators implement the Generator interface, see 'interfaces/index.ts'
  For more information on the models spec please refer to https://github.com/Green-Software-Foundation/if/issues/332

### Authentication

N/A

### inputs

The model's 'config' section in the impl file determines its behaviour.
'inputs' section is ignored.

### Typescript Usage

```typescript
const mock_obs_model = await new MockObservations().configure('mock-observations', {
  timestamp-from: 2023-07-06T00:00
  timestamp-to: 2023-07-06T00:10
  duration: 60
  components:
    - instance-type: A1
  generators:
    common:
      region: uk-west
});
const inputs = [{}];
const results = mock_obs_model.execute(inputs);
```

### IMPL Example

```yaml
mock-observations:
  timestamp-from: 2023-07-06T00:00
  timestamp-to: 2023-07-06T00:10
  duration: 60
  components:
    - instance-type: A1
    - instance-type: B1
  generators:
    common:
      region: uk-west
      common-key: common-val
    randint:
      cpu-util:
        min: 1
        max: 99
      mem-util:
        min: 1
        max: 99
```
