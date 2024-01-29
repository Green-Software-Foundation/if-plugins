import {KeyValuePair} from '../../../types/common';

export interface Generator {
  /**
   * initialise the generator with the given name and config.
   */
  initialise(name: String, config: KeyValuePair): void;
  /**
   * generate the next value, optionally based on historical values
   */
  next(historical: Object[] | undefined): Object;
}
