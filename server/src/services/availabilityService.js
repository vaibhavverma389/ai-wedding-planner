import { Listing } from '../models/Listing.js';
import { RentalReservation } from '../models/RentalReservation.js';
import { env } from '../config/environment.js';

/**
 * Check real-time rental availability for a date interval
 * @param {string|ObjectId} listingId
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @param {number} requestedQuantity
 * @returns {Promise<{ isAvailable: boolean, availableQuantity: number, totalStock: number, reservedQuantity: number }>}
 */
export const checkRentalAvailability = async (listingId, startDate, endDate, requestedQuantity = 1) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    throw new Error('Invalid rental date range. Start date must be strictly before end date.');
  }

  const listing = await Listing.findById(listingId).select('stockQuantity transactionType status');
  if (!listing) {
    throw new Error('Listing not found');
  }

  if (listing.transactionType !== 'RENT') {
    return {
      isAvailable: listing.stockQuantity >= requestedQuantity,
      availableQuantity: listing.stockQuantity,
      totalStock: listing.stockQuantity,
      reservedQuantity: 0
    };
  }

  const totalStock = listing.stockQuantity || 0;

  // Find all active reservations that overlap with [start, end]
  // An overlap occurs when: existingStart <= requestedEnd AND existingEnd >= requestedStart
  const overlappingReservations = await RentalReservation.find({
    listingId,
    status: { $in: ['HOLD', 'CONFIRMED'] },
    startDate: { $lte: end },
    endDate: { $gte: start },
    $or: [
      { status: 'CONFIRMED' },
      { status: 'HOLD', expiresAt: { $gt: now } }
    ]
  }).lean();

  const reservedQuantity = overlappingReservations.reduce((sum, res) => sum + res.quantity, 0);
  const availableQuantity = Math.max(0, totalStock - reservedQuantity);

  return {
    isAvailable: availableQuantity >= requestedQuantity,
    availableQuantity,
    totalStock,
    reservedQuantity
  };
};

/**
 * Create an atomic temporary reservation hold
 * @param {string|ObjectId} listingId
 * @param {string|ObjectId} userId
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @param {number} quantity
 * @param {number} holdMinutes
 * @returns {Promise<RentalReservation>}
 */
export const createRentalHold = async (
  listingId,
  userId,
  startDate,
  endDate,
  quantity = 1,
  holdMinutes = env.RENTAL_HOLD_DURATION_MINUTES || 15
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const availability = await checkRentalAvailability(listingId, start, end, quantity);

  if (!availability.isAvailable) {
    const error = new Error(`Insufficient rental inventory. Only ${availability.availableQuantity} unit(s) available for the selected dates.`);
    error.statusCode = 409;
    error.errorCode = 'INSUFFICIENT_INVENTORY';
    throw error;
  }

  const listing = await Listing.findById(listingId).select('pricing');
  const depositAmount = (listing?.pricing?.securityDeposit || 0) * quantity;
  const expiresAt = new Date(now.getTime() + holdMinutes * 60 * 1000);

  const reservationHold = await RentalReservation.create({
    listingId,
    userId,
    startDate: start,
    endDate: end,
    quantity,
    depositAmount,
    status: 'HOLD',
    expiresAt
  });

  return reservationHold;
};

/**
 * Release an active reservation hold
 */
export const releaseRentalHold = async (holdId, userId = null) => {
  const query = { _id: holdId, status: 'HOLD' };
  if (userId) {
    query.userId = userId;
  }

  const hold = await RentalReservation.findOne(query);
  if (!hold) return null;

  hold.status = 'CANCELLED';
  await hold.save();
  return hold;
};

/**
 * Cleanup all expired holds
 */
export const cleanupExpiredHolds = async () => {
  const now = new Date();
  const result = await RentalReservation.updateMany(
    {
      status: 'HOLD',
      expiresAt: { $lte: now }
    },
    {
      $set: { status: 'CANCELLED' }
    }
  );
  return result.modifiedCount;
};
