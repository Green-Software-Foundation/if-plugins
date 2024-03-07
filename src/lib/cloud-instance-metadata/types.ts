export type InstanceInput = {
  'cpu-cores-utilized': string;
  'cpu-cores-available': string;
  'memory-available': string;
  'cpu-model-name': string;
  'cpu-tdp': string;
};

export type RegionInput = {
  'cfe-region': string;
  'em-zone-id': string;
  'wt-region-id': string;
  location: string;
  geolocation: string;
};
