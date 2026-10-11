import { sendError } from '../utils/response.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required before checking permissions.', 401, 'AUTH_REQUIRED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this action. Required: ${allowedRoles.join(', ')}`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};
