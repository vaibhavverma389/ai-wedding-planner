import { User } from '../models/User.js';
import { VendorProfile } from '../models/VendorProfile.js';
import { Listing } from '../models/Listing.js';
import { OrderGroup } from '../models/OrderGroup.js';
import { Order } from '../models/Order.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const adminController = {
  /**
   * Platform-wide analytics
   */
  async getPlatformAnalytics(req, res, next) {
    try {
      const [
        totalUsers,
        totalCustomers,
        totalVendors,
        pendingVendorApprovals,
        totalListings,
        orderGroups,
        orders
      ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: 'customer' }),
        User.countDocuments({ role: 'vendor' }),
        VendorProfile.countDocuments({ verificationStatus: 'pending' }),
        Listing.countDocuments({}),
        OrderGroup.find({ paymentStatus: 'PAID' }),
        Order.find({ paymentStatus: 'PAID' })
      ]);

      const grossMerchandiseValue = orderGroups.reduce(
        (sum, og) => sum + (og.pricingSnapshot?.grossPayableAmount || 0),
        0
      );

      const totalPlatformCommissions = orders.reduce(
        (sum, o) => sum + (o.pricing?.commissionAmount || 0),
        0
      );

      return sendSuccess(
        res,
        {
          grossMerchandiseValue,
          totalPlatformCommissions,
          totalUsers,
          totalCustomers,
          totalVendors,
          pendingVendorApprovals,
          totalListings,
          totalPaidOrders: orderGroups.length
        },
        'Platform analytics retrieved.'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * List all vendor profiles for approval
   */
  async getVendorsList(req, res, next) {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (status) filter.verificationStatus = status;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const [vendors, total] = await Promise.all([
        VendorProfile.find(filter)
          .populate('userId', 'name email phone createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        VendorProfile.countDocuments(filter)
      ]);

      return sendSuccess(
        res,
        {
          vendors,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
          }
        },
        'Vendors list retrieved.'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update vendor verification status
   */
  async updateVendorVerificationStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { verificationStatus, rejectionReason } = req.body;

      if (!['pending', 'verified', 'rejected', 'suspended'].includes(verificationStatus)) {
        return sendError(res, 'Invalid verification status.', 400);
      }

      const vendor = await VendorProfile.findByIdAndUpdate(
        id,
        {
          $set: {
            verificationStatus,
            ...(rejectionReason && { rejectionReason })
          }
        },
        { new: true }
      );

      if (!vendor) {
        return sendError(res, 'Vendor profile not found.', 404);
      }

      return sendSuccess(res, { vendor }, `Vendor verification status updated to ${verificationStatus}.`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Moderate listing
   */
  async moderateListing(req, res, next) {
    try {
      const { id } = req.params;
      const { status, moderationNotes } = req.body;

      if (!['published', 'rejected', 'archived', 'pending_approval'].includes(status)) {
        return sendError(res, 'Invalid listing status.', 400);
      }

      const listing = await Listing.findByIdAndUpdate(
        id,
        {
          $set: {
            status,
            ...(moderationNotes && { moderationNotes })
          }
        },
        { new: true }
      );

      if (!listing) {
        return sendError(res, 'Listing not found.', 404);
      }

      return sendSuccess(res, { listing }, `Listing status updated to ${status}.`);
    } catch (error) {
      next(error);
    }
  }
};
