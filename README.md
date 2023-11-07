# if-model-template

`If-model-template` is an environmental impact calculator template which exposes an API for [IEF](https://github.com/Green-Software-Foundation/ief) to retrieve energy and embodied carbon estimates.

## Implementation

Here can be implementation details of the model. For example which API is used, transformations and etc.

## Usage

To run the `<MODEL_HERE>`, model an instance of `ModelPluginInterface` must be created and its `configure()` method called. Then, the model's `execute()` method can be called, passing required arguments to it.

This is how you could run the model in Typescript:

```typescript
async function runModel() {
  const newModel = await new Model().configure(params);
  const usage = await newModel.calculate([
    {
      timestamp: '2021-01-01T00:00:00Z',
      duration: '15s',
      'cpu-util': 34,
    },
    {
      timestamp: '2021-01-01T00:00:15Z',
      duration: '15s',
      'cpu-util': 12,
    },
  ]);

  console.log(usage);
}

runBoavizta();
```
