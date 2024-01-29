import {KeyValuePair} from '../../../types/common';
import {ERRORS} from '../../../util/errors';
import {buildErrorMessage} from '../../../util/helpers';

import {Generator} from '../interfaces';

const {InputValidationError} = ERRORS;

class RandIntGenerator implements Generator {
  private static readonly MIN: string = 'min';
  private static readonly MAX: string = 'max';
  private fieldToPopulate = '';
  private min = 0;
  private max = 0;
  private errorBuilder = buildErrorMessage('RandIntGenerator');

  initialise(fieldToPopulate: string, config: KeyValuePair): void {
    this.fieldToPopulate = this.validateName(fieldToPopulate);
    this.validateConfig(config);
    this.min = config[RandIntGenerator.MIN];
    this.max = config[RandIntGenerator.MAX];
  }

  next(_historical: Object[]): Object {
    const retObject = {
      [this.fieldToPopulate]: this.generateRandInt(),
    };
    return retObject;
  }

  /**
   * validate the provided name is not null, empty or all-spaces string.
   * returns the validated name, otherwise throws an InputValidationError.
   */
  private validateName(name: string | null): string {
    if (name === null || name.trim() === '') {
      throw new InputValidationError(
        this.errorBuilder({message: 'name is empty or all spaces'})
      );
    }
    return name;
  }

  /**
   * validate the provided config is not null or empty, and contains the mandatory fields min and max
   * returns a copy of the validated config, otherwise throws an InputValidationError.
   */
  private validateConfig<T>(config: T): void {
    if (!config || Object.keys(config).length === 0) {
      throw new InputValidationError(
        this.errorBuilder({message: 'Config must not be null or empty'})
      );
    }
    if (!Object.prototype.hasOwnProperty.call(config, RandIntGenerator.MIN)) {
      throw new InputValidationError(
        this.errorBuilder({
          message: 'config is missing ' + RandIntGenerator.MIN,
        })
      );
    }
    if (!Object.prototype.hasOwnProperty.call(config, RandIntGenerator.MAX)) {
      throw new InputValidationError(
        this.errorBuilder({
          message: 'config is missing ' + RandIntGenerator.MAX,
        })
      );
    }
  }

  /**
   * generate a random integer between initialized min and max values
   */
  private generateRandInt(): number {
    const randomNumber = Math.random();
    const scaledNumber = randomNumber * (this.max - this.min) + this.min;
    const truncatedNumber = Math.trunc(scaledNumber);
    return truncatedNumber;
  }
}

export default RandIntGenerator;
