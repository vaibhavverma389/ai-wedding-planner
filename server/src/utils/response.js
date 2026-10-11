/**
 * Standard API Response Envelope
 */
export const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    data
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

export const sendError = (res, message = 'Internal Server Error', statusCode = 500, errorCode = 'SERVER_ERROR', details = null) => {
  const response = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details ? { details } : {})
    }
  };
  return res.status(statusCode).json(response);
};
