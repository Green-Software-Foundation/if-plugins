import {ZodIssue, ZodSchema} from 'zod';

import {ERRORS} from './errors';

const {InputValidationError} = ERRORS;

const prettifyErrorMessage = (issues: string) => {
  const issuesArray = JSON.parse(issues);

  return issuesArray.map((issue: ZodIssue) => {
    const {code, path, message} = issue;
    const flattenPath = path.map(part =>
      typeof part === 'number' ? `[${part}]` : part
    );
    const fullPath = flattenPath.join('.');

    return `"${fullPath}" parameter is ${message.toLowerCase()}. Error code: ${code}.`;
  });
};

export const validate = (schema: ZodSchema, object: any) => {
  const validationResult = schema.safeParse(object);

  if (!validationResult.success) {
    throw new InputValidationError(
      prettifyErrorMessage(validationResult.error.message)
    );
  }

  return validationResult.data;
};
