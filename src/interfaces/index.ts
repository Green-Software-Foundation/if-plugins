import {ModelParams, PluginParams} from '../types/common';

/**
 * Base interface for models.
 */
export interface ModelPluginInterface {
  /**
   * Configures instance with given params.
   */
  configure(params: object | undefined): Promise<ModelPluginInterface>;

  /**
   * Calculates `output` based on given model's `input`.
   */
  execute(inputs: ModelParams[]): Promise<ModelParams[]>;
}

/**
 * Base interface for plugins.
 */
export type PluginInterface = {
  execute: (
    inputs: PluginParams[],
    config?: Record<string, any>
  ) => Promise<PluginParams[]>;
  metadata: {
    kind: string;
  };
  [key: string]: any;
};
