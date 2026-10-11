import {
  checkRentalAvailability,
  createRentalHold,
  releaseRentalHold
} from '../services/availabilityService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const checkAvailability = async (req, res, next) => {
  try {
    const { listingId, startDate, endDate, quantity = 1 } = req.query;

    if (!listingId || !startDate || !endDate) {
      return sendError(res, 'listingId, startDate, and endDate are required query parameters', 400, 'MISSING_PARAMS');
    }

    const result = await checkRentalAvailability(listingId, startDate, endDate, Number(quantity));

    return sendSuccess(res, result, 'Availability checked successfully');
  } catch (err) {
    next(err);
  }
};

export const placeHold = async (req, res, next) => {
  try {
    const { listingId, startDate, endDate, quantity = 1 } = req.body;

    if (!listingId || !startDate || !endDate) {
      return sendError(res, 'listingId, startDate, and endDate are required', 400, 'MISSING_PARAMS');
    }

    const hold = await createRentalHold(listingId, req.user._id, startDate, endDate, Number(quantity));

    return sendSuccess(
      res,
      {
        holdId: hold._id,
        listingId: hold.listingId,
        startDate: hold.startDate,
        endDate: hold.endDate,
        quantity: hold.quantity,
        depositAmount: hold.depositAmount,
        expiresAt: hold.expiresAt,
        status: hold.status
      },
      '15-minute rental hold secured successfully',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const releaseHold = async (req, res, next) => {
  try {
    const { id } = req.params;
    const released = await releaseRentalHold(id, req.user._id);

    if (!released) {
      return sendError(res, 'Active hold not found or unauthorized', 404, 'HOLD_NOT_FOUND');
    }

    return sendSuccess(res, null, 'Hold released successfully');
  } catch (err) {
    next(err);
  }
};
