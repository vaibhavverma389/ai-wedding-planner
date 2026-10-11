import { QuoteRequest } from '../models/QuoteRequest.js';
import { Quotation } from '../models/Quotation.js';
import { VendorProfile } from '../models/VendorProfile.js';
import { Cart } from '../models/Cart.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createQuoteRequest = async (req, res, next) => {
  try {
    const {
      vendorId,
      listingId,
      eventType,
      eventDate,
      guestCount,
      city,
      venueDetails,
      budgetRange,
      requirements
    } = req.body;

    const vendor = await VendorProfile.findById(vendorId);
    if (!vendor) {
      return sendError(res, 'Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    const quoteRequest = await QuoteRequest.create({
      customerId: req.user._id,
      vendorId,
      listingId: listingId || null,
      eventType,
      eventDate,
      guestCount,
      city,
      venueDetails: venueDetails || '',
      budgetRange: budgetRange || { min: 0, max: 0 },
      requirements,
      status: 'PENDING'
    });

    return sendSuccess(res, quoteRequest, 'Quotation request submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getQuoteRequests = async (req, res, next) => {
  try {
    const user = req.user;
    let query = {};

    if (user.role === 'vendor') {
      const profile = await VendorProfile.findOne({ userId: user._id });
      if (!profile) return sendError(res, 'Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
      query.vendorId = profile._id;
    } else {
      query.customerId = user._id;
    }

    const requests = await QuoteRequest.find(query)
      .populate('customerId', 'name email phone')
      .populate('vendorId', 'businessName slug')
      .populate('listingId', 'title')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, requests, 'Quotation requests retrieved');
  } catch (err) {
    next(err);
  }
};

export const issueQuotation = async (req, res, next) => {
  try {
    const {
      quoteRequestId,
      title,
      lineItems,
      inclusions,
      exclusions,
      milestones,
      validDays = 7
    } = req.body;

    const quoteRequest = await QuoteRequest.findById(quoteRequestId);
    if (!quoteRequest) {
      return sendError(res, 'Quote request not found', 404, 'QUOTE_REQUEST_NOT_FOUND');
    }

    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id });
    if (!vendorProfile || quoteRequest.vendorId.toString() !== vendorProfile._id.toString()) {
      return sendError(res, 'Unauthorized to issue quotation for this request', 403, 'FORBIDDEN');
    }

    const subtotal = lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
    const gstAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + gstAmount;

    // Default milestones if none passed: 30% advance, 70% final
    let calculatedMilestones = milestones;
    if (!calculatedMilestones || calculatedMilestones.length === 0) {
      calculatedMilestones = [
        {
          name: 'Advance Booking Deposit (30%)',
          percentage: 30,
          amount: Math.round(totalAmount * 0.30),
          status: 'PENDING'
        },
        {
          name: 'Final Event Balance (70%)',
          percentage: 70,
          amount: totalAmount - Math.round(totalAmount * 0.30),
          status: 'PENDING'
        }
      ];
    }

    const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

    const quotation = await Quotation.create({
      quoteRequestId,
      vendorId: vendorProfile._id,
      customerId: quoteRequest.customerId,
      title,
      lineItems,
      subtotal,
      gstAmount,
      totalAmount,
      inclusions: inclusions || [],
      exclusions: exclusions || [],
      milestones: calculatedMilestones,
      validUntil,
      status: 'SENT'
    });

    quoteRequest.status = 'QUOTED';
    await quoteRequest.save();

    return sendSuccess(res, quotation, 'Quotation issued successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getQuotationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id)
      .populate('vendorId', 'businessName slug logoUrl')
      .populate('customerId', 'name email phone');

    if (!quotation) {
      return sendError(res, 'Quotation not found', 404, 'QUOTATION_NOT_FOUND');
    }

    return sendSuccess(res, quotation, 'Quotation details retrieved');
  } catch (err) {
    next(err);
  }
};

export const acceptQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return sendError(res, 'Quotation not found', 404, 'QUOTATION_NOT_FOUND');
    }

    if (quotation.customerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Unauthorized to accept this quotation', 403, 'FORBIDDEN');
    }

    if (quotation.status !== 'SENT') {
      return sendError(res, `Quotation cannot be accepted from status: ${quotation.status}`, 400, 'INVALID_STATUS');
    }

    quotation.status = 'ACCEPTED';
    await quotation.save();

    await QuoteRequest.findByIdAndUpdate(quotation.quoteRequestId, { status: 'ACCEPTED' });

    // Automatically add the advance milestone (Index 0) to customer cart for checkout
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    cart.items.push({
      listingId: null,
      transactionType: 'BOOK_SERVICE',
      quantity: 1,
      quotationId: quotation._id,
      milestoneIndex: 0
    });
    await cart.save();

    return sendSuccess(res, quotation, 'Quotation accepted and advance milestone added to cart');
  } catch (err) {
    next(err);
  }
};

export const declineQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return sendError(res, 'Quotation not found', 404, 'QUOTATION_NOT_FOUND');
    }

    if (quotation.customerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Unauthorized to decline this quotation', 403, 'FORBIDDEN');
    }

    quotation.status = 'REJECTED';
    await quotation.save();

    return sendSuccess(res, quotation, 'Quotation declined');
  } catch (err) {
    next(err);
  }
};
