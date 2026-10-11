import { User } from '../models/User.js';
import { VendorProfile } from '../models/VendorProfile.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../middleware/auditLogger.js';

// Cookie options for secure Refresh Token storage
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
});

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, businessName, serviceableCities } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 409, 'EMAIL_EXISTS');
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'customer'
    });

    let vendorProfile = null;
    if (role === 'vendor') {
      const generatedSlug = (businessName || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

      vendorProfile = await VendorProfile.create({
        userId: user._id,
        businessName: businessName || `${name}'s Wedding Services`,
        slug: generatedSlug,
        serviceableCities: serviceableCities || ['Delhi NCR']
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

    logAudit({
      actorUserId: user._id,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      targetEntity: 'User',
      targetId: user._id.toString(),
      ipAddress: req.ip
    });

    return sendSuccess(
      res,
      {
        user: {
          ...user.toJSON(),
          vendorProfile: vendorProfile ? { id: vendorProfile._id, slug: vendorProfile.slug, businessName: vendorProfile.businessName } : null
        },
        accessToken
      },
      'Registration successful',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status !== 'active') {
      return sendError(res, 'Account is suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

    let vendorProfile = null;
    if (user.role === 'vendor') {
      vendorProfile = await VendorProfile.findOne({ userId: user._id });
    }

    return sendSuccess(
      res,
      {
        user: {
          ...user.toJSON(),
          vendorProfile: vendorProfile ? { id: vendorProfile._id, slug: vendorProfile.slug, businessName: vendorProfile.businessName } : null
        },
        accessToken
      },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return sendError(res, 'No refresh token provided', 401, 'REFRESH_TOKEN_REQUIRED');
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return sendError(res, 'Invalid or expired refresh token. Please log in again.', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = await User.findById(decoded.id);
    if (!user || user.status !== 'active') {
      return sendError(res, 'User session invalid', 401, 'USER_INVALID');
    }

    // Check token version to support session revocation
    if ((user.tokenVersion || 0) !== decoded.tokenVersion) {
      return sendError(res, 'Session has been invalidated. Please log in again.', 401, 'SESSION_REVOKED');
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', newRefreshToken, getRefreshCookieOptions());

    return sendSuccess(
      res,
      { accessToken: newAccessToken },
      'Token refreshed successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('refreshToken', getClearCookieOptions());
  return sendSuccess(res, null, 'Successfully logged out');
};

export const getMe = async (req, res, next) => {
  try {
    let vendorProfile = null;
    if (req.user.role === 'vendor') {
      vendorProfile = await VendorProfile.findOne({ userId: req.user._id });
    }

    return sendSuccess(res, {
      user: {
        ...req.user.toJSON(),
        vendorProfile: vendorProfile ? { id: vendorProfile._id, slug: vendorProfile.slug, businessName: vendorProfile.businessName, verificationStatus: vendorProfile.verificationStatus } : null
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatarUrl } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    return sendSuccess(res, { user: user.toJSON() }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Incorrect current password', 400, 'INCORRECT_PASSWORD');
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate all previous refresh tokens
    await user.save();

    res.clearCookie('refreshToken', getClearCookieOptions());

    logAudit({
      actorUserId: user._id,
      actorRole: user.role,
      action: 'PASSWORD_CHANGED',
      targetEntity: 'User',
      targetId: user._id.toString(),
      ipAddress: req.ip
    });

    return sendSuccess(res, null, 'Password updated successfully. Please log in again.');
  } catch (err) {
    next(err);
  }
};
