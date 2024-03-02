import * as dayjs from 'dayjs';

import {Generator} from './interfaces/index';

export type ObservationParams = {
  duration: number;
  timeBucket: dayjs.Dayjs;
  component: Record<string, string>;
  generators: Generator[];
};

export type RandIntGeneratorParams = {
  name: string;
  min: number;
  max: number;
};
