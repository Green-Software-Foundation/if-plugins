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