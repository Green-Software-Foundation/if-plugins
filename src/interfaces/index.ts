import {ModelParams} from '../types/common';

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
