import {ErrorFormatParams} from '../types/helpers';

/**
 * Formats given error according to class instance, scope and message.
 */
export const buildErrorMessage =
  (classInstanceName: string) => (params: ErrorFormatParams) => {
    const {scope, message} = params;

    return `${classInstanceName}${scope ? `(${scope})` : ''}: ${message}.`;
  };
