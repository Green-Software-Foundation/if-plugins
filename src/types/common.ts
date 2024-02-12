export type KeyValuePair = {
  [key: string]: any;
};

export type ModelParams = {
  timestamp: string;
  duration: number;
  [key: string]: any;
};

export type PluginParams = {
  timestamp: string;
  duration: number;
  [key: string]: any;
};

// export type PluginInterface = {
//   execute: (
//     inputs: PluginParams[],
//     config?: Record<string, any>
//   ) => PluginParams[];
//   metadata: {
//     kind: string;
//   };
//   [key: string]: any;
// };
