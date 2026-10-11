import { VendorProfile } from '../models/VendorProfile.js';
import { Listing } from '../models/Listing.js';
import { Order } from '../models/Order.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const vendorDashboardController = {
  /**
   * Vendor analytics: earnings, pending bookings, active listings
   */
  async getDashboardAnalytics(req, res, next) {
    try {
      const vendor = await VendorProfile.findOne({ userId: req.user.id });
      if (!vendor) {
        return sendError(res, 'Vendor profile not found for current user.', 404, 'VENDOR_NOT_FOUND');
      }

      const [orders, totalListings, publishedListings] = await Promise.all([
        Order.find({ vendorId: vendor._id }).sort({ createdAt: -1 }),
        Listing.countDocuments({ vendorId: vendor._id }),
        Listing.countDocuments({ vendorId: vendor._id, status: 'published' })
      ]);

      const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
      const totalEarnings = paidOrders.reduce((sum, o) => sum + (o.pricing.vendorPayoutAmount || 0), 0);
      const totalSecurityDepositsHeld = paidOrders
        .filter((o) => o.rentalTracking?.depositRefundStatus === 'HELD')
        .reduce((sum, o) => sum + (o.pricing.depositAmount || 0), 0);

      const pendingFulfillmentCount = orders.filter(
        (o) => o.paymentStatus === 'PAID' && ['CONFIRMED', 'PROCESSING'].includes(o.fulfillmentStatus)
      ).length;

      const activeRentalsCount = orders.filter(
        (o) => o.fulfillmentStatus === 'DISPATCHED' || o.fulfillmentStatus === 'DELIVERED'
      ).length;

      return sendSuccess(
        res,
        {
          vendor,
          analytics: {
            totalEarnings,
            totalOrders: orders.length,
            paidOrdersCount: paidOrders.length,
            totalListings,
            publishedListings,
            pendingFulfillmentCount,
            activeRentalsCount,
            totalSecurityDepositsHeld
          },
          recentOrders: orders.slice(0, 5)
        },
        'Vendor dashboard analytics retrieved.'
      );
    } catch (error) {
      next(error);
    }
  }
};
