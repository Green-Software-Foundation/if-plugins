import { ModelPluginInterface } from '../../interfaces';

import { ERRORS } from '../../util/errors';
import { buildErrorMessage } from '../../util/helpers';

import { ModelParams } from '../../types/common';

const { InputValidationError } = ERRORS;

export class AggregateModel implements ModelPluginInterface {
    authParams: object | undefined; // Defined for compatibility. Not used in this.
    staticParams: object | undefined;
    // todo: get aggregateMetrics and method from impl
    aggregationMetrics: Array<string> = ['energy', 'carbon'];
    aggregationMethod: string = 'sum';

    errorBuilder = buildErrorMessage(AggregateModel);

    async configure(
        staticParams: object | undefined = undefined
    ): Promise<ModelPluginInterface> {
        this.staticParams = staticParams;
        return this;
    }

    /**
     * Calculate the total emissions for a list of inputs.
     *
     * Each input require:
     * @param {Object[]} inputs
     * @param {string} inputs[].timestamp RFC3339 timestamp string
     * @param {number} inputs[].mem-util percentage mem usage
     */
    async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
        if (inputs === undefined) {
            throw new InputValidationError(
                this.errorBuilder({
                    message: 'Input data is missing',
                })
            );
        }

        if (!Array.isArray(inputs)) {
            throw new InputValidationError(
                this.errorBuilder({
                    message: 'Input data is not an array',
                })
            );
        }

        var aggregates: Object[] = [];

        for (const metricName of this.aggregationMetrics) {
            var accumulator: number = 0
            inputs.map((input: ModelParams) => {
                accumulator += parseFloat(input[`${metricName}`])
            });
            aggregates.push({ name: metricName, value: accumulator })
        }

        return inputs.map((input: ModelParams) => {
            aggregates.forEach(item => {
                const arr = Object.values(item)
                console.log("ignore", input)
                input["aggregate-" + arr[0]] = arr[1]
            })
            return input
        });
    }


}