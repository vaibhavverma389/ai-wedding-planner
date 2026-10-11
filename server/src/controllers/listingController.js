import { Listing } from '../models/Listing.js';
import { VendorProfile } from '../models/VendorProfile.js';
import { Category } from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getListings = async (req, res, next) => {
  try {
    const {
      search,
      category,
      subcategoryId,
      transactionType,
      city,
      minPrice,
      maxPrice,
      minRating,
      vendorId,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const query = { status: 'published' };

    // 1. Full-text or regex search
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { 'serviceDetails.inclusions': { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // 2. Category filtering (by slug or ObjectId)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.categoryId = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          query.categoryId = cat._id;
        } else {
          // If category slug does not exist, return empty result
          return sendSuccess(res, [], 'No listings found', 200, {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0
          });
        }
      }
    }

    if (subcategoryId) {
      query.subcategoryId = subcategoryId;
    }

    // 3. Transaction type filter
    if (transactionType) {
      query.transactionType = transactionType;
    }

    // 4. City filter (case-insensitive in serviceableCities array)
    if (city) {
      query.serviceableCities = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    // 5. Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query['pricing.basePrice'] = {};
      if (minPrice !== undefined) query['pricing.basePrice'].$gte = Number(minPrice);
      if (maxPrice !== undefined) query['pricing.basePrice'].$lte = Number(maxPrice);
    }

    // 6. Rating filter
    if (minRating !== undefined) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // 7. Vendor filter
    if (vendorId) {
      query.vendorId = vendorId;
    }

    // 8. Sorting strategy
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { 'pricing.basePrice': 1 };
    if (sort === 'price_desc') sortOptions = { 'pricing.basePrice': -1 };
    if (sort === 'rating') sortOptions = { averageRating: -1, totalReviews: -1 };
    if (sort === 'popular') sortOptions = { viewsCount: -1, totalReviews: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate('vendorId', 'businessName slug logoUrl serviceableCities averageRating totalReviews')
        .populate('categoryId', 'name slug')
        .populate('subcategoryId', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments(query)
    ]);

    return sendSuccess(res, listings, 'Listings retrieved successfully', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    next(err);
  }
};

export const getListingBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const listing = await Listing.findOne({ slug })
      .populate('vendorId', 'businessName slug logoUrl bannerUrl description serviceableCities averageRating totalReviews')
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug');

    if (!listing) {
      return sendError(res, 'Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    // Increment views count asynchronously
    Listing.updateOne({ _id: listing._id }, { $inc: { viewsCount: 1 } }).exec();

    return sendSuccess(res, listing, 'Listing details retrieved');
  } catch (err) {
    next(err);
  }
};

export const createListing = async (req, res, next) => {
  try {
    const user = req.user;
    const vendorProfile = await VendorProfile.findOne({ userId: user._id });

    if (!vendorProfile && user.role !== 'admin') {
      return sendError(res, 'Vendor profile required to create listings', 403, 'VENDOR_PROFILE_REQUIRED');
    }

    const { title } = req.body;
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const listing = await Listing.create({
      ...req.body,
      vendorId: vendorProfile ? vendorProfile._id : req.body.vendorId,
      slug: uniqueSlug
    });

    return sendSuccess(res, listing, 'Listing created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const listing = await Listing.findById(id);
    if (!listing) {
      return sendError(res, 'Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    // Verify ownership: vendor owns listing or user is admin
    if (user.role !== 'admin') {
      const vendorProfile = await VendorProfile.findOne({ userId: user._id });
      if (!vendorProfile || listing.vendorId.toString() !== vendorProfile._id.toString()) {
        return sendError(res, 'You are not authorized to update this listing', 403, 'FORBIDDEN');
      }
    }

    // If title changed, update slug
    if (req.body.title && req.body.title !== listing.title) {
      const baseSlug = req.body.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      req.body.slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate('vendorId', 'businessName slug')
      .populate('categoryId', 'name slug');

    return sendSuccess(res, updatedListing, 'Listing updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const listing = await Listing.findById(id);
    if (!listing) {
      return sendError(res, 'Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    if (user.role !== 'admin') {
      const vendorProfile = await VendorProfile.findOne({ userId: user._id });
      if (!vendorProfile || listing.vendorId.toString() !== vendorProfile._id.toString()) {
        return sendError(res, 'You are not authorized to delete this listing', 403, 'FORBIDDEN');
      }
    }

    // Soft archive
    listing.status = 'archived';
    await listing.save();

    return sendSuccess(res, null, 'Listing archived successfully');
  } catch (err) {
    next(err);
  }
};

export const getMyListings = async (req, res, next) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id });
    if (!vendorProfile) {
      return sendError(res, 'Vendor profile not found', 404, 'VENDOR_PROFILE_NOT_FOUND');
    }

    const listings = await Listing.find({ vendorId: vendorProfile._id })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, listings, 'Vendor listings retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateListingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, moderationNotes } = req.body;
    const user = req.user;

    const listing = await Listing.findById(id);
    if (!listing) {
      return sendError(res, 'Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    // Non-admin can only toggle between draft and published or archived
    if (user.role !== 'admin') {
      const vendorProfile = await VendorProfile.findOne({ userId: user._id });
      if (!vendorProfile || listing.vendorId.toString() !== vendorProfile._id.toString()) {
        return sendError(res, 'Unauthorized to modify status', 403, 'FORBIDDEN');
      }
      if (['rejected'].includes(status)) {
        return sendError(res, 'Only administrators can reject listings', 403, 'FORBIDDEN');
      }
    }

    listing.status = status;
    if (moderationNotes) {
      listing.moderationNotes = moderationNotes;
    }
    await listing.save();

    return sendSuccess(res, listing, `Listing status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};
