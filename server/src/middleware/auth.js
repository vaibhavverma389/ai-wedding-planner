import { verifyAccessToken } from '../utils/tokens.js';
import { User } from '../models/User.js';
import { sendError } from '../utils/response.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, 'Authentication required. No token provided.', 401, 'AUTH_REQUIRED');
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return sendError(res, 'Invalid or expired access token. Please log in again.', 401, 'INVALID_TOKEN');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User account not found.', 401, 'USER_NOT_FOUND');
    }

    if (user.status !== 'active') {
      return sendError(res, 'Account has been suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Optional authentication middleware (for public endpoints with user-aware logic)
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await User.findById(decoded.id);
        if (user && user.status === 'active') {
          req.user = user;
        }
      }
    }
    next();
  } catch {
    next();
  }
};
