import { sendError } from '../utils/response.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const errorDetails = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return sendError(
          res,
          'Validation failed. Please verify your input.',
          400,
          'VALIDATION_ERROR',
          errorDetails
        );
      }

      // Assign parsed/sanitized data back to request
      req[source] = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
};
