export type KeyValuePair = {
  [key: string]: any;
};

export type PluginParams = {
  timestamp: string;
  duration: number;
  [key: string]: any;
};

export type ConfigParams = Record<string, any>;
