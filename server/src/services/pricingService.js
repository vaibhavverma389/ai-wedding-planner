import { Listing } from '../models/Listing.js';
import { Quotation } from '../models/Quotation.js';
import { env } from '../config/environment.js';

/**
 * Calculate comprehensive, tamper-proof order and cart totals using trusted database values
 * @param {Array} items - Array of cart/order items
 * @param {string} [couponCode] - Optional coupon code
 * @returns {Promise<Object>} Calculated itemized price breakdown
 */
export const calculateCartPricing = async (items = [], couponCode = null) => {
  const gstRate = (env.DEFAULT_GST_PERCENT || 18) / 100;
  const defaultCommissionRate = (env.DEFAULT_PLATFORM_COMMISSION_PERCENT || 10) / 100;

  let totalItemAmount = 0;
  let totalDepositAmount = 0;
  const processedItems = [];
  const vendorBreakdowns = {};

  for (const item of items) {
    let unitPrice = 0;
    let lineSubtotal = 0;
    let lineDeposit = 0;
    let rentalDays = 1;
    let listingSnapshot = null;
    let vendorId = null;

    if (item.quotationId) {
      // Milestone service payment
      const quotation = await Quotation.findById(item.quotationId).populate('vendorId', 'businessName slug commissionRate');
      if (!quotation) {
        throw new Error('Quotation referenced in cart item not found');
      }
      const milestone = quotation.milestones[item.milestoneIndex || 0];
      if (!milestone) {
        throw new Error('Quotation milestone index not found');
      }

      unitPrice = milestone.amount;
      lineSubtotal = unitPrice;
      vendorId = quotation.vendorId._id.toString();
      listingSnapshot = {
        title: `${quotation.title} - ${milestone.name}`,
        vendorBusinessName: quotation.vendorId.businessName,
        transactionType: 'BOOK_SERVICE'
      };
    } else {
      // Regular listing (RENT, BUY_NEW, BUY_USED, BOOK_SERVICE)
      const listing = await Listing.findById(item.listingId)
        .populate('vendorId', 'businessName slug commissionRate')
        .lean();

      if (!listing) {
        throw new Error(`Listing with ID ${item.listingId} not found`);
      }

      vendorId = listing.vendorId._id.toString();
      unitPrice = listing.pricing.basePrice;

      if (item.transactionType === 'RENT') {
        if (!item.rentalStartDate || !item.rentalEndDate) {
          throw new Error(`Rental dates are required for rental item: ${listing.title}`);
        }
        const start = new Date(item.rentalStartDate);
        const end = new Date(item.rentalEndDate);
        rentalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        lineSubtotal = unitPrice * rentalDays * item.quantity;
        lineDeposit = (listing.pricing.securityDeposit || 0) * item.quantity;
      } else {
        lineSubtotal = unitPrice * item.quantity;
      }

      listingSnapshot = {
        title: listing.title,
        slug: listing.slug,
        vendorBusinessName: listing.vendorId.businessName,
        media: listing.media?.[0]?.url || null,
        transactionType: listing.transactionType
      };
    }

    totalItemAmount += lineSubtotal;
    totalDepositAmount += lineDeposit;

    const commissionPercent = defaultCommissionRate;
    const itemCommission = Math.round(lineSubtotal * commissionPercent);
    const itemVendorEarnings = lineSubtotal - itemCommission;

    const processedItem = {
      _id: item._id,
      listingId: item.listingId,
      quotationId: item.quotationId || null,
      milestoneIndex: item.milestoneIndex ?? null,
      transactionType: item.transactionType,
      quantity: item.quantity,
      rentalStartDate: item.rentalStartDate || null,
      rentalEndDate: item.rentalEndDate || null,
      rentalDays: item.transactionType === 'RENT' ? rentalDays : null,
      reservationHoldId: item.reservationHoldId || null,
      unitPrice,
      lineSubtotal,
      lineDeposit,
      listing: listingSnapshot
    };

    processedItems.push(processedItem);

    // Group line items by vendor for split order fulfillment
    if (!vendorBreakdowns[vendorId]) {
      vendorBreakdowns[vendorId] = {
        vendorId,
        items: [],
        subtotal: 0,
        depositAmount: 0,
        commissionAmount: 0,
        vendorPayoutAmount: 0
      };
    }

    vendorBreakdowns[vendorId].items.push(processedItem);
    vendorBreakdowns[vendorId].subtotal += lineSubtotal;
    vendorBreakdowns[vendorId].depositAmount += lineDeposit;
    vendorBreakdowns[vendorId].commissionAmount += itemCommission;
    vendorBreakdowns[vendorId].vendorPayoutAmount += itemVendorEarnings;
  }

  // Calculate taxes on taxable items (security deposits are non-taxable refundable deposits)
  const totalTaxAmount = Math.round(totalItemAmount * gstRate);
  let discountAmount = 0;

  // Simple mock coupon check for demonstration
  if (couponCode && couponCode.toUpperCase() === 'SHAADI10') {
    discountAmount = Math.round(totalItemAmount * 0.10); // 10% discount
  }

  const taxableAmount = Math.max(0, totalItemAmount - discountAmount);
  const finalGstAmount = Math.round(taxableAmount * gstRate);
  const grossPayableAmount = taxableAmount + finalGstAmount + totalDepositAmount;

  return {
    items: processedItems,
    vendorOrders: Object.values(vendorBreakdowns),
    totalItemAmount,
    discountAmount,
    totalTaxAmount: finalGstAmount,
    gstPercent: Math.round(gstRate * 100),
    totalDepositAmount,
    grossPayableAmount
  };
};
