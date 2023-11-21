import {ErrorFormatParams} from '../types/helpers';

/**
 * Formats given error according to class instance, scope and message.
 */
export const buildErrorMessage =
  (classInstance: any) => (params: ErrorFormatParams) => {
    const {scope, message} = params;

    return `${classInstance.name}${scope ? `(${scope})` : ''}: ${message}.`;
  };
