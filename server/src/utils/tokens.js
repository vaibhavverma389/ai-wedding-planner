import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      tokenVersion: user.tokenVersion || 0
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};
