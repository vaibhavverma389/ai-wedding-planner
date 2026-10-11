import { Cart } from '../models/Cart.js';
import { Listing } from '../models/Listing.js';
import { createRentalHold, releaseRentalHold } from '../services/availabilityService.js';
import { calculateCartPricing } from '../services/pricingService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const calculatedSummary = await calculateCartPricing(cart.items, cart.couponCode);

    return sendSuccess(
      res,
      {
        cartId: cart._id,
        couponCode: cart.couponCode,
        ...calculatedSummary
      },
      'Cart retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const addItemToCart = async (req, res, next) => {
  try {
    const { listingId, quantity = 1, rentalStartDate, rentalEndDate, quotationId, milestoneIndex } = req.body;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    let transactionType = 'BUY_NEW';
    let reservationHoldId = null;

    if (quotationId) {
      transactionType = 'BOOK_SERVICE';
    } else {
      const listing = await Listing.findById(listingId);
      if (!listing || listing.status !== 'published') {
        return sendError(res, 'Listing not available', 404, 'LISTING_NOT_FOUND');
      }

      transactionType = listing.transactionType;

      if (transactionType === 'RENT') {
        if (!rentalStartDate || !rentalEndDate) {
          return sendError(res, 'Rental start and end dates are required for rental items', 400, 'DATES_REQUIRED');
        }

        // Place an atomic 15-minute hold for this rental item
        const hold = await createRentalHold(
          listingId,
          req.user._id,
          rentalStartDate,
          rentalEndDate,
          Number(quantity)
        );
        reservationHoldId = hold._id;
      }
    }

    cart.items.push({
      listingId: listingId || null,
      transactionType,
      quantity: Number(quantity),
      rentalStartDate: rentalStartDate || null,
      rentalEndDate: rentalEndDate || null,
      reservationHoldId,
      quotationId: quotationId || null,
      milestoneIndex: milestoneIndex ?? null
    });

    await cart.save();

    const calculatedSummary = await calculateCartPricing(cart.items, cart.couponCode);

    return sendSuccess(
      res,
      {
        cartId: cart._id,
        ...calculatedSummary
      },
      'Item added to cart successfully',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const removeItemFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return sendError(res, 'Cart not found', 404, 'CART_NOT_FOUND');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return sendError(res, 'Item not found in cart', 404, 'ITEM_NOT_FOUND');
    }

    // If item had an active reservation hold, release it
    if (item.reservationHoldId) {
      await releaseRentalHold(item.reservationHoldId, req.user._id);
    }

    cart.items.pull(itemId);
    await cart.save();

    const calculatedSummary = await calculateCartPricing(cart.items, cart.couponCode);

    return sendSuccess(
      res,
      {
        cartId: cart._id,
        ...calculatedSummary
      },
      'Item removed from cart'
    );
  } catch (err) {
    next(err);
  }
};

export const applyCoupon = async (req, res, next) => {
  try {
    const { couponCode } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    cart.couponCode = couponCode ? couponCode.trim().toUpperCase() : null;
    await cart.save();

    const calculatedSummary = await calculateCartPricing(cart.items, cart.couponCode);

    return sendSuccess(
      res,
      {
        cartId: cart._id,
        couponCode: cart.couponCode,
        ...calculatedSummary
      },
      cart.couponCode ? `Coupon ${cart.couponCode} applied successfully` : 'Coupon removed'
    );
  } catch (err) {
    next(err);
  }
};
