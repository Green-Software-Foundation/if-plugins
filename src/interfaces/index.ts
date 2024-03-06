import {ConfigParams, PluginParams} from '../types/common';

/**
 * Base interface for plugins.
 */
export type PluginInterface = {
  execute: (
    inputs: PluginParams[],
    config?: ConfigParams
  ) => Promise<PluginParams[]>;
  metadata: {
    kind: string;
  };
  [key: string]: any;
};

/**
 * Base interface for exhaust plugins.
 */
export interface ExhaustPluginInterface {
  /**
   * Execute exhaust based `tree`, produce output to a file in `outputPath`.
   */
  execute(tree: any, outputPath?: string): void;
}
