import {ModelParams} from '../../../types/common';

export class TimeSeriesDataExtractor {
  extract(inputs: ModelParams[]): [string[], number[], number[]] {
    const timestamps: string[] = [];
    const energyValues: number[] = [];
    const carbonValues: number[] = [];
    inputs.forEach(input => {
      const timestamp = input['timestamp'];
      const energy = input['energy'];
      const carbon = input['carbon'];
      timestamps.push(timestamp);
      energyValues.push(energy);
      carbonValues.push(carbon);
    });
    return [timestamps, energyValues, carbonValues];
  }
}
