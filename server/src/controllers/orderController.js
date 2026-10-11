import { Order } from '../models/Order.js';
import { OrderGroup } from '../models/OrderGroup.js';
import { VendorProfile } from '../models/VendorProfile.js';
import { paymentService } from '../services/paymentService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const orderController = {
  /**
   * Customer: View all placed order groups and sub-orders
   */
  async getMyOrders(req, res, next) {
    try {
      const customerId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const filter = { customerId };
      if (status) filter.paymentStatus = status;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const [orderGroups, total] = await Promise.all([
        OrderGroup.find(filter)
          .populate({
            path: 'vendorOrders',
            populate: { path: 'vendorId', select: 'businessName slug logo' }
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        OrderGroup.countDocuments(filter)
      ]);

      return sendSuccess(
        res,
        {
          orders: orderGroups,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
          }
        },
        'Customer orders retrieved.'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Vendor: View orders belonging to their store
   */
  async getVendorOrders(req, res, next) {
    try {
      const vendorProfile = await VendorProfile.findOne({ userId: req.user.id });
      if (!vendorProfile) {
        return sendError(res, 'Vendor profile not found for current user.', 404, 'VENDOR_NOT_FOUND');
      }

      const { page = 1, limit = 10, status } = req.query;
      const filter = { vendorId: vendorProfile._id };
      if (status) filter.fulfillmentStatus = status;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate('customerId', 'name email phone')
          .populate('orderGroupId', 'orderGroupNumber deliveryAddress paidAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Order.countDocuments(filter)
      ]);

      return sendSuccess(
        res,
        {
          orders,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
          }
        },
        'Vendor orders retrieved.'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single order by ID with role-based data isolation
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id)
        .populate('customerId', 'name email phone')
        .populate('vendorId', 'businessName slug supportEmail phone logo')
        .populate('orderGroupId');

      if (!order) {
        return sendError(res, 'Order not found.', 404, 'ORDER_NOT_FOUND');
      }

      // Authorization & Data Isolation Check
      const isCustomerOwner = order.customerId._id.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';

      let isVendorOwner = false;
      if (req.user.role === 'vendor') {
        const vendorProfile = await VendorProfile.findOne({ userId: req.user.id });
        if (vendorProfile && order.vendorId._id.toString() === vendorProfile._id.toString()) {
          isVendorOwner = true;
        }
      }

      if (!isCustomerOwner && !isVendorOwner && !isAdmin) {
        return sendError(res, 'Access denied. You do not have permission to view this order.', 403, 'FORBIDDEN');
      }

      return sendSuccess(res, { order }, 'Order details retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Vendor / Admin: Update Order Fulfillment Status
   */
  async updateFulfillmentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { fulfillmentStatus, courierName, trackingNumber, deliveryNotes } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        return sendError(res, 'Order not found.', 404, 'ORDER_NOT_FOUND');
      }

      // Check ownership
      if (req.user.role !== 'admin') {
        const vendorProfile = await VendorProfile.findOne({ userId: req.user.id });
        if (!vendorProfile || order.vendorId.toString() !== vendorProfile._id.toString()) {
          return sendError(res, 'You are not authorized to update this order.', 403, 'FORBIDDEN');
        }
      }

      if (fulfillmentStatus) order.fulfillmentStatus = fulfillmentStatus;
      if (courierName) order.deliveryDetails.courierName = courierName;
      if (trackingNumber) order.deliveryDetails.trackingNumber = trackingNumber;
      if (deliveryNotes) order.deliveryDetails.deliveryNotes = deliveryNotes;

      await order.save();
      return sendSuccess(res, { order }, 'Order fulfillment status updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cancel Order (Customer or Vendor before dispatch)
   */
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        return sendError(res, 'Order not found.', 404, 'ORDER_NOT_FOUND');
      }

      // Check authorization
      const isCustomer = order.customerId.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      let isVendor = false;
      if (req.user.role === 'vendor') {
        const vendorProfile = await VendorProfile.findOne({ userId: req.user.id });
        if (vendorProfile && order.vendorId.toString() === vendorProfile._id.toString()) {
          isVendor = true;
        }
      }

      if (!isCustomer && !isVendor && !isAdmin) {
        return sendError(res, 'Unauthorized to cancel this order.', 403, 'FORBIDDEN');
      }

      if (order.fulfillmentStatus === 'DELIVERED' || order.fulfillmentStatus === 'COMPLETED') {
        return sendError(res, 'Delivered orders cannot be cancelled.', 400, 'CANNOT_CANCEL_DELIVERED');
      }

      if (order.cancellation.isCancelled) {
        return sendError(res, 'Order is already cancelled.', 400, 'ALREADY_CANCELLED');
      }

      // Eligible refund calculation: if PAID, full refund of subtotal + deposit
      const refundAmount = order.paymentStatus === 'PAID' ? order.pricing.subtotal + order.pricing.depositAmount : 0;

      const refund = await paymentService.processRefund({
        orderId: order._id,
        amount: refundAmount,
        reason: reason || 'Order cancelled before fulfillment',
        refundType: 'CANCELLATION',
        initiatedById: req.user.id
      });

      return sendSuccess(
        res,
        {
          orderId: order._id,
          refund
        },
        'Order cancelled successfully and refund processed.'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Vendor: Inspect returned rental item and release security deposit
   */
  async returnRentalDeposit(req, res, next) {
    try {
      const { id } = req.params;
      const { damageDeduction = 0, deductionReason = '' } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        return sendError(res, 'Order not found.', 404, 'ORDER_NOT_FOUND');
      }

      // Check vendor authorization
      if (req.user.role !== 'admin') {
        const vendorProfile = await VendorProfile.findOne({ userId: req.user.id });
        if (!vendorProfile || order.vendorId.toString() !== vendorProfile._id.toString()) {
          return sendError(res, 'Unauthorized to inspect this rental order.', 403, 'FORBIDDEN');
        }
      }

      if (order.rentalTracking.depositRefundStatus === 'REFUNDED') {
        return sendError(res, 'Deposit has already been refunded.', 400, 'DEPOSIT_ALREADY_REFUNDED');
      }

      const totalHeldDeposit = order.pricing.depositAmount;
      if (totalHeldDeposit <= 0) {
        return sendError(res, 'This order does not contain a refundable security deposit.', 400, 'NO_DEPOSIT');
      }

      const netRefundAmount = Math.max(0, totalHeldDeposit - damageDeduction);

      const refund = await paymentService.processRefund({
        orderId: order._id,
        amount: netRefundAmount,
        reason: deductionReason || 'Rental item returned and inspected',
        refundType: 'RENTAL_DEPOSIT_RETURN',
        initiatedById: req.user.id
      });

      order.rentalTracking.actualReturnDate = new Date();
      order.rentalTracking.depositRefundStatus = damageDeduction > 0 ? 'FORFEITED_DAMAGE' : 'REFUNDED';
      order.rentalTracking.deductionReason = deductionReason;
      order.fulfillmentStatus = 'RETURNED_INSPECTED';
      await order.save();

      return sendSuccess(
        res,
        {
          totalHeldDeposit,
          damageDeduction,
          netRefundAmount,
          refund
        },
        'Rental item inspected and security deposit settled.'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Admin: List all platform orders
   */
  async getAllOrdersAdmin(req, res, next) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const filter = {};
      if (status) filter.fulfillmentStatus = status;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate('customerId', 'name email phone')
          .populate('vendorId', 'businessName slug')
          .populate('orderGroupId', 'orderGroupNumber paymentStatus')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Order.countDocuments(filter)
      ]);

      return sendSuccess(
        res,
        {
          orders,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
          }
        },
        'Admin orders retrieved.'
      );
    } catch (error) {
      next(error);
    }
  }
};
