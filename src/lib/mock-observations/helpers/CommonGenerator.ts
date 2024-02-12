import {KeyValuePair} from '../../../types/common';
import {ERRORS} from '../../../util/errors';
import {buildErrorMessage} from '../../../util/helpers';

import {Generator} from '../interfaces';

const {InputValidationError} = ERRORS;

class CommonGenerator implements Generator {
  private commonKeyValuePairs!: KeyValuePair;
  private errorBuilder = buildErrorMessage('CommonGenerator');

  initialise(config: KeyValuePair): void {
    this.commonKeyValuePairs = this.validateConfig(config);
  }

  /**
   * Generates next value by copying the validated config.
   */
  next(_historical: Object[]): Object {
    return Object.assign({}, this.commonKeyValuePairs);
  }

  /**
   * Creates new copy of the given `object`.
   */
  private copyObject<T>(object: T): T {
    return Object.assign({}, object);
  }

  /**
   * validate the provided config is not null or empty.
   * returns a copy of the validated config, otherwise throws an InputValidationError.
   */
  private validateConfig<T>(config: T): T {
    if (!config || Object.keys(config).length === 0) {
      throw new InputValidationError(
        this.errorBuilder({message: 'Config must not be null or empty'})
      );
    }
    return this.copyObject<T>(config);
  }
}

export default CommonGenerator;
