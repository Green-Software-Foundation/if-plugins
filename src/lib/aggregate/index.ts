import { ModelPluginInterface } from '../../interfaces';

import { ERRORS } from '../../util/errors';
import { buildErrorMessage } from '../../util/helpers';

import { ModelParams } from '../../types/common';

const { InputValidationError } = ERRORS;

export class AggregateModel implements ModelPluginInterface {
    authParams: object | undefined; // Defined for compatibility. Not used in this.
    staticParams: object | undefined;
    // todo: get aggregateMetrics and method from impl
    aggregationMetrics: Array<string> = [];
    aggregationMethod = 'sum';

    errorBuilder = buildErrorMessage(AggregateModel);

    async configure(
        staticParams: object | undefined = undefined
    ): Promise<ModelPluginInterface> {
        this.staticParams = staticParams;
        if (
            staticParams !== undefined &&
            'aggregation-method' in staticParams &&
            typeof staticParams['aggregation-method'] === 'string'
        ) {
            this.aggregationMethod = staticParams['aggregation-method'];
        } else {
            this.aggregationMethod = 'sum';
        }
        if (
            staticParams !== undefined &&
            'aggregation-metrics' in staticParams &&
            typeof (staticParams['aggregation-metrics'] === 'string[]')
        ) {
            this.aggregationMetrics = staticParams[
                'aggregation-metrics'
            ] as Array<string>;
        } else {
            ERRORS.InputValidationError(
                'aggregation metrics not parsed correctly. Please provide an  array of strings.'
            );
        }
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

        const aggregates: Object[] = [];
        for (const metricName of this.aggregationMetrics) {
            let accumulator = 0;
            inputs.forEach(input => {
                if (!(metricName in input)) {
                    throw new InputValidationError(
                        this.errorBuilder({
                            message: `aggregation metric ${metricName} not found in input data`,
                        })
                    );
                }
                accumulator += parseFloat(input[`${metricName}`]);
            });
            aggregates.push({ name: metricName, value: accumulator });
        }

        const denominator = inputs.length;
        const averages = ['av', 'avg', 'avrg', 'average', 'mean'];

        return inputs.map((input: ModelParams) => {
            aggregates.forEach(item => {
                const arr = Object.values(item);
                let outValue = arr[1];
                if (averages.includes(this.aggregationMethod)) {
                    outValue = outValue / denominator;
                }

                input['aggregate-' + arr[0]] = outValue;
            });
            return input;
        });
    }
}
