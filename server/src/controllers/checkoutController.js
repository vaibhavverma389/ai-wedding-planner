import crypto from 'crypto';
import { Cart } from '../models/Cart.js';
import { Address } from '../models/Address.js';
import { OrderGroup } from '../models/OrderGroup.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { calculateCartPricing } from '../services/pricingService.js';
import { paymentService } from '../services/paymentService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { env } from '../config/environment.js';

export const checkoutController = {
  /**
   * Initialize checkout: validate cart, price server-side, create pending orders & Razorpay order
   */
  async initializeCheckout(req, res, next) {
    try {
      const customerId = req.user.id;
      const { deliveryAddress, addressId, idempotencyKey } = req.body;

      // 1. Fetch Cart
      const cart = await Cart.findOne({ userId: customerId });
      if (!cart || !cart.items || cart.items.length === 0) {
        return sendError(res, 'Your cart is empty. Cannot initiate checkout.', 400, 'CART_EMPTY');
      }

      // 2. Validate Address
      let finalAddress = deliveryAddress;
      if (!finalAddress && addressId) {
        const savedAddress = await Address.findOne({ _id: addressId, userId: customerId });
        if (savedAddress) {
          finalAddress = {
            fullName: savedAddress.fullName,
            phone: savedAddress.phone,
            street: savedAddress.street,
            city: savedAddress.city,
            state: savedAddress.state,
            pincode: savedAddress.pincode
          };
        }
      }

      if (!finalAddress || !finalAddress.street || !finalAddress.city || !finalAddress.pincode) {
        return sendError(res, 'Valid delivery address is required for checkout.', 400, 'ADDRESS_REQUIRED');
      }

      // 3. Idempotency check: if existing pending OrderGroup exists with identical idempotencyKey
      if (idempotencyKey) {
        const existingOrderGroup = await OrderGroup.findOne({ idempotencyKey, customerId })
          .populate('vendorOrders');
        if (existingOrderGroup && existingOrderGroup.paymentStatus === 'PENDING') {
          return sendSuccess(
            res,
            {
              orderGroupId: existingOrderGroup._id,
              orderGroupNumber: existingOrderGroup.orderGroupNumber,
              razorpayOrderId: existingOrderGroup.razorpayOrderId,
              amount: existingOrderGroup.pricingSnapshot.grossPayableAmount,
              currency: 'INR',
              keyId: env.RAZORPAY_KEY_ID
            },
            'Existing pending checkout session retrieved.'
          );
        }
      }

      // 4. Server-side Pricing Calculation
      const pricingBreakdown = await calculateCartPricing(cart.items, cart.couponCode);

      // 5. Generate unique OrderGroup number
      const timestamp = Date.now().toString().slice(-6);
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
      const orderGroupNumber = `SS-GRP-${timestamp}-${randomSuffix}`;

      // 6. Create OrderGroup document
      const orderGroup = new OrderGroup({
        orderGroupNumber,
        customerId,
        deliveryAddress: finalAddress,
        pricingSnapshot: {
          itemsSubtotal: pricingBreakdown.totalItemAmount,
          securityDepositTotal: pricingBreakdown.totalDepositAmount,
          discountTotal: pricingBreakdown.discountAmount,
          taxTotal: pricingBreakdown.totalTaxAmount,
          gstPercent: pricingBreakdown.gstPercent,
          deliveryFeeTotal: 0,
          grossPayableAmount: pricingBreakdown.grossPayableAmount
        },
        paymentStatus: 'PENDING',
        idempotencyKey: idempotencyKey || null
      });

      // 7. Create sub-orders per vendor
      const createdSubOrderIds = [];
      for (const [index, vendorOrderData] of pricingBreakdown.vendorOrders.entries()) {
        const orderNumber = `SS-ORD-${timestamp}-${randomSuffix}-${index + 1}`;
        const hasRentals = vendorOrderData.items.some((i) => i.transactionType === 'RENT');

        const order = await Order.create({
          orderNumber,
          orderGroupId: orderGroup._id,
          customerId,
          vendorId: vendorOrderData.vendorId,
          items: vendorOrderData.items.map((item) => ({
            listingId: item.listingId,
            quotationId: item.quotationId,
            milestoneIndex: item.milestoneIndex,
            title: item.listing?.title || 'Wedding Item',
            slug: item.listing?.slug || null,
            transactionType: item.transactionType,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineSubtotal: item.lineSubtotal,
            lineDeposit: item.lineDeposit,
            rentalPeriod: {
              startDate: item.rentalStartDate,
              endDate: item.rentalEndDate,
              rentalDays: item.rentalDays
            },
            reservationHoldId: item.reservationHoldId,
            itemStatus: 'CONFIRMED'
          })),
          pricing: {
            subtotal: vendorOrderData.subtotal,
            depositAmount: vendorOrderData.depositAmount,
            commissionAmount: vendorOrderData.commissionAmount,
            vendorPayoutAmount: vendorOrderData.vendorPayoutAmount
          },
          paymentStatus: 'PENDING',
          fulfillmentStatus: 'PENDING',
          rentalTracking: {
            depositRefundStatus: hasRentals ? 'HELD' : 'NOT_APPLICABLE'
          }
        });

        createdSubOrderIds.push(order._id);
      }

      orderGroup.vendorOrders = createdSubOrderIds;

      // 8. Create Gateway Order via Razorpay
      const gatewayOrder = await paymentService.createGatewayOrder({
        amountInRupees: pricingBreakdown.grossPayableAmount,
        receiptId: orderGroupNumber,
        notes: {
          orderGroupNumber,
          customerId: customerId.toString()
        }
      });

      orderGroup.razorpayOrderId = gatewayOrder.id;
      await orderGroup.save();

      // 9. Create pending Payment entry
      await Payment.create({
        orderGroupId: orderGroup._id,
        customerId,
        gateway: 'RAZORPAY',
        razorpayOrderId: gatewayOrder.id,
        amountInRupees: pricingBreakdown.grossPayableAmount,
        amountInPaise: gatewayOrder.amount,
        status: 'PENDING'
      });

      return sendSuccess(
        res,
        {
          orderGroupId: orderGroup._id,
          orderGroupNumber: orderGroup.orderGroupNumber,
          razorpayOrderId: gatewayOrder.id,
          amount: pricingBreakdown.grossPayableAmount,
          currency: 'INR',
          keyId: env.RAZORPAY_KEY_ID,
          pricing: pricingBreakdown
        },
        'Checkout initialized successfully.',
        201
      );
    } catch (error) {
      next(error);
    }
  }
};
