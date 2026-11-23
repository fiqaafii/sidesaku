/**
 * Standar format respon JSON untuk seluruh API
 */

export function successResponse(res, message, data = null, statusCode = 200) {
  const payload = {
    success: true,
    message,
  };
  if (data !== null && data !== undefined) {
    payload.data = data;
  }
  return res.status(statusCode).json(payload);
}

export function errorResponse(res, message, errors = null, statusCode = 400) {
  const payload = {
    success: false,
    message,
  };
  if (errors !== null && errors !== undefined) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
}
