import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { VendorProfile } from '../models/VendorProfile.js';
import { Category } from '../models/Category.js';
import { Listing } from '../models/Listing.js';
import { logger } from './logger.js';

export const initialCategories = [
  {
    name: 'Wedding Decorations',
    slug: 'wedding-decorations',
    description: 'Mandap, floral styling, lighting, furniture, and theme decorations',
    subcategories: [
      { name: 'Mandap Decoration', slug: 'mandap-decoration' },
      { name: 'Stage Decoration', slug: 'stage-decoration' },
      { name: 'Flower Decoration', slug: 'flower-decoration' },
      { name: 'Lighting', slug: 'lighting' },
      { name: 'Furniture and Seating', slug: 'furniture-and-seating' }
    ]
  },
  {
    name: 'Baraat and Transportation',
    slug: 'baraat-and-transportation',
    description: 'Vintage cars, luxury sedans, decorated horse chariots, and guest coaches',
    subcategories: [
      { name: 'Wedding Cars', slug: 'wedding-cars' },
      { name: 'Luxury Cars', slug: 'luxury-cars' },
      { name: 'Vintage Cars', slug: 'vintage-cars' },
      { name: 'Decorated Vehicles', slug: 'decorated-vehicles' }
    ]
  },
  {
    name: 'Haldi Ceremony',
    slug: 'haldi-ceremony',
    description: 'Vibrant yellow themes, floral jewelry, brass urulis, and ceremony props',
    subcategories: [
      { name: 'Haldi Decor', slug: 'haldi-decor' },
      { name: 'Seating Arrangements', slug: 'haldi-seating' },
      { name: 'Floral Accessories', slug: 'floral-accessories' },
      { name: 'Ceremony Props', slug: 'ceremony-props' }
    ]
  },
  {
    name: 'Mehendi Ceremony',
    slug: 'mehendi-ceremony',
    description: 'Mehendi artists, bohemian canopies, floor cushions, and festive props',
    subcategories: [
      { name: 'Mehendi Artists', slug: 'mehendi-artists' },
      { name: 'Mehendi Decor', slug: 'mehendi-decor' },
      { name: 'Seating and Props', slug: 'mehendi-seating-and-props' }
    ]
  },
  {
    name: 'Wedding Essentials',
    slug: 'wedding-essentials',
    description: 'Bridal lehengas, sherwanis, turbans, return gifts, and trousseau packing',
    subcategories: [
      { name: 'Wedding Outfits', slug: 'wedding-outfits' },
      { name: 'Jewelry and Accessories', slug: 'jewelry-and-accessories' },
      { name: 'Gifts and Return Gifts', slug: 'gifts-and-return-gifts' },
      { name: 'Invitation Materials', slug: 'invitation-materials' }
    ]
  },
  {
    name: 'Catering and Food',
    slug: 'catering-and-food',
    description: 'Traditional Royal Thalis, live chaat counters, and multi-cuisine banquets',
    subcategories: [
      { name: 'Vegetarian Catering', slug: 'vegetarian-catering' },
      { name: 'Non-vegetarian Catering', slug: 'non-vegetarian-catering' },
      { name: 'Snacks and Beverages', slug: 'snacks-and-beverages' },
      { name: 'Customized Catering Packages', slug: 'custom-catering-packages' }
    ]
  },
  {
    name: 'Photography and Videography',
    slug: 'photography-and-videography',
    description: 'Cinematic wedding films, pre-wedding destination shoots, and albums',
    subcategories: [
      { name: 'Wedding Photographers', slug: 'wedding-photographers' },
      { name: 'Cinematographers', slug: 'cinematographers' },
      { name: 'Pre-wedding Shoots', slug: 'pre-wedding-shoots' },
      { name: 'Drone Services', slug: 'drone-services' }
    ]
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Professional wedding DJs, Punjabi dhol ensembles, live Sufi bands, and sound systems',
    subcategories: [
      { name: 'DJs', slug: 'wedding-djs' },
      { name: 'Live Bands', slug: 'live-bands' },
      { name: 'Sound Systems', slug: 'sound-systems' },
      { name: 'Lighting Equipment', slug: 'lighting-equipment' }
    ]
  },
  {
    name: 'Venues and Accommodation',
    slug: 'venues-and-accommodation',
    description: 'Heritage Havelis, destination wedding lawns, and five-star banquet halls',
    subcategories: [
      { name: 'Banquet Halls', slug: 'banquet-halls' },
      { name: 'Wedding Lawns', slug: 'wedding-lawns' },
      { name: 'Farmhouses', slug: 'farmhouses' },
      { name: 'Guest Accommodation', slug: 'guest-accommodation' }
    ]
  },
  {
    name: 'Wedding Professionals',
    slug: 'wedding-professionals',
    description: 'Certified bridal makeup artists, Vedic pandits, choreographers, and planners',
    subcategories: [
      { name: 'Makeup Artists', slug: 'makeup-artists' },
      { name: 'Pandits', slug: 'vedic-pandits' },
      { name: 'Wedding Planners', slug: 'wedding-planners' },
      { name: 'Choreographers', slug: 'sangeet-choreographers' }
    ]
  }
];

export const seedDatabase = async () => {
  try {
    logger.info('🌱 Seeding ShaadiSaathi categories, vendors, and listings...');

    // 1. Seed Categories & Subcategories
    const categoryMap = {};
    for (let i = 0; i < initialCategories.length; i++) {
      const catData = initialCategories[i];
      let parent = await Category.findOne({ slug: catData.slug });
      if (!parent) {
        parent = await Category.create({
          name: catData.name,
          slug: catData.slug,
          description: catData.description,
          order: i + 1,
          isActive: true
        });
      }
      categoryMap[catData.slug] = parent._id;

      for (const sub of catData.subcategories) {
        let child = await Category.findOne({ slug: sub.slug });
        if (!child) {
          child = await Category.create({
            name: sub.name,
            slug: sub.slug,
            parentId: parent._id,
            isActive: true
          });
        }
        categoryMap[sub.slug] = child._id;
      }
    }

    // 2. Seed Test Vendors
    const testVendors = [
      {
        email: 'royal.decor@shaadisaathi.in',
        name: 'Vikram Singhania',
        businessName: 'Royal Rajasthan Mandap Decorators',
        phone: '9811223344',
        serviceableCities: ['Delhi NCR', 'Jaipur', 'Udaipur'],
        description: 'Heritage Mandap & Royal Wedding stage design specialists with 15+ years experience.'
      },
      {
        email: 'vintage.wheels@shaadisaathi.in',
        name: 'Kabir Oberoi',
        businessName: 'Oberoi Vintage & Luxury Wedding Cars',
        phone: '9822334455',
        serviceableCities: ['Delhi NCR', 'Chandigarh', 'Jaipur'],
        description: 'Exquisite classic Rolls Royce, vintage Chevrolets, and luxury Mercedes Baraat convoys.'
      },
      {
        email: 'drishti.caterers@shaadisaathi.in',
        name: 'Drishti Mehta',
        businessName: 'Shree Krishna Royal Caterers',
        phone: '9833445566',
        serviceableCities: ['Delhi NCR', 'Mumbai', 'Ahmedabad'],
        description: 'Authentic pure vegetarian Rajasthani, Gujarati, and multi-cuisine royal banquet catering.'
      }
    ];

    const vendorProfileMap = {};
    for (const vData of testVendors) {
      let user = await User.findOne({ email: vData.email });
      if (!user) {
        user = await User.create({
          name: vData.name,
          email: vData.email,
          phone: vData.phone,
          password: 'Password123!',
          role: 'vendor'
        });
      }

      let profile = await VendorProfile.findOne({ userId: user._id });
      if (!profile) {
        const slug = vData.businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        profile = await VendorProfile.create({
          userId: user._id,
          businessName: vData.businessName,
          slug,
          description: vData.description,
          serviceableCities: vData.serviceableCities,
          verificationStatus: 'verified',
          averageRating: 4.9,
          totalReviews: 24
        });
      }
      vendorProfileMap[vData.email] = profile;
    }

    // 3. Seed Demonstration Listings across the 4 Transaction Types
    const decorVendor = vendorProfileMap['royal.decor@shaadisaathi.in'];
    const carVendor = vendorProfileMap['vintage.wheels@shaadisaathi.in'];
    const cateringVendor = vendorProfileMap['drishti.caterers@shaadisaathi.in'];

    const sampleListings = [
      // RENT: Vintage Wedding Car
      {
        vendorId: carVendor._id,
        title: '1947 Classic Vintage Rolls-Royce Baraat Car',
        slug: '1947-classic-vintage-rolls-royce-baraat-car',
        description: 'Chauffeured, pristine-condition white vintage convertible with fresh red rose garland decorations for Groom Baraat entry.',
        categoryId: categoryMap['baraat-and-transportation'],
        subcategoryId: categoryMap['vintage-cars'],
        transactionType: 'RENT',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
            isPrimary: true,
            altText: 'Vintage Rolls Royce Wedding Car'
          }
        ],
        pricing: {
          basePrice: 25000,
          priceUnit: 'per_day',
          securityDeposit: 10000
        },
        rentalTerms: {
          minRentalDays: 1,
          maxRentalDays: 3,
          lateFeePerDay: 5000
        },
        serviceableCities: ['Delhi NCR', 'Jaipur', 'Chandigarh'],
        stockQuantity: 2,
        status: 'published',
        averageRating: 5.0,
        totalReviews: 14
      },
      // RENT: Carved Wooden Royal Chairs
      {
        vendorId: decorVendor._id,
        title: 'Carved Teakwood Royal Maharaja Chairs (Pair)',
        slug: 'carved-teakwood-royal-maharaja-chairs-pair',
        description: 'Hand-carved gold leaf finish royal bride & groom throne chairs with rich crimson velvet upholstery.',
        categoryId: categoryMap['wedding-decorations'],
        subcategoryId: categoryMap['furniture-and-seating'],
        transactionType: 'RENT',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
            isPrimary: true,
            altText: 'Royal Maharaja Chairs'
          }
        ],
        pricing: {
          basePrice: 6500,
          priceUnit: 'per_day',
          securityDeposit: 3000
        },
        rentalTerms: {
          minRentalDays: 1,
          maxRentalDays: 7,
          lateFeePerDay: 1500
        },
        serviceableCities: ['Delhi NCR', 'Jaipur', 'Udaipur'],
        stockQuantity: 10,
        status: 'published',
        averageRating: 4.8,
        totalReviews: 22
      },
      // BUY NEW: Brass Urulis with Floating Diyas
      {
        vendorId: decorVendor._id,
        title: 'Handcrafted Pure Brass Traditional Uruli with Peacock Diyas',
        slug: 'handcrafted-pure-brass-traditional-uruli-peacock-diyas',
        description: 'Traditional 14-inch heavy brass uruli bowl for fresh marigold and floating candle setups at entrance and Haldi venue.',
        categoryId: categoryMap['haldi-ceremony'],
        subcategoryId: categoryMap['ceremony-props'],
        transactionType: 'BUY_NEW',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1200&q=80',
            isPrimary: true,
            altText: 'Brass Peacock Uruli'
          }
        ],
        pricing: {
          basePrice: 4200,
          priceUnit: 'per_item',
          securityDeposit: 0
        },
        serviceableCities: ['Delhi NCR', 'Jaipur', 'Mumbai', 'Bangalore'],
        stockQuantity: 25,
        status: 'published',
        averageRating: 4.9,
        totalReviews: 31
      },
      // BUY USED: Embroidered Heritage Velvet Backdrop
      {
        vendorId: decorVendor._id,
        title: 'Pre-Owned Zardozi Embroidered Royal Stage Backdrop (12x8 ft)',
        slug: 'pre-owned-zardozi-embroidered-royal-stage-backdrop',
        description: 'Magnificent heavy maroon velvet backdrop curtain with gold zardozi peacocks. Used in only 2 indoor palace weddings. Dry cleaned and inspected.',
        categoryId: categoryMap['wedding-decorations'],
        subcategoryId: categoryMap['stage-decoration'],
        transactionType: 'BUY_USED',
        usedItemCondition: {
          condition: 'like_new',
          ageInMonths: 4,
          defectsDisclosed: 'Minor microscopic scuff on bottom lining edge, invisible from 1 foot away.'
        },
        media: [
          {
            url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
            isPrimary: true,
            altText: 'Zardozi Velvet Backdrop'
          }
        ],
        pricing: {
          basePrice: 18500,
          priceUnit: 'per_item',
          securityDeposit: 0
        },
        serviceableCities: ['Delhi NCR', 'Jaipur'],
        stockQuantity: 1,
        status: 'published',
        averageRating: 4.7,
        totalReviews: 8
      },
      // BOOK SERVICE: Royal Banquet Catering Package
      {
        vendorId: cateringVendor._id,
        title: 'Shree Krishna Shahi Wedding Banquet (100-Course Menu)',
        slug: 'shree-krishna-shahi-wedding-banquet-catering',
        description: 'Complete live food festival featuring Dal Baati Churma, Amritsari Kulcha counters, Awadhi Biryani, and 24 traditional Indian sweets.',
        categoryId: categoryMap['catering-and-food'],
        subcategoryId: categoryMap['custom-catering-packages'],
        transactionType: 'BOOK_SERVICE',
        serviceDetails: {
          serviceType: 'catering',
          inclusions: [
            '100+ Food Items & Live Counters',
            'Trained Uniformed Waitstaff & Stewards',
            'Luxury Bone China Crockery & Silverware',
            'Mineral Water & Welcome Mocktail Bar'
          ],
          exclusions: ['Venue Table Linens', 'Liquor License'],
          capacityMin: 200,
          capacityMax: 2000
        },
        media: [
          {
            url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
            isPrimary: true,
            altText: 'Royal Wedding Banquet'
          }
        ],
        pricing: {
          basePrice: 1850,
          priceUnit: 'per_plate',
          customQuotationOnly: false
        },
        serviceableCities: ['Delhi NCR', 'Jaipur', 'Ahmedabad', 'Mumbai'],
        stockQuantity: 5,
        status: 'published',
        averageRating: 5.0,
        totalReviews: 47
      }
    ];

    for (const listingData of sampleListings) {
      const existingListing = await Listing.findOne({ slug: listingData.slug });
      if (!existingListing) {
        await Listing.create(listingData);
      }
    }

    logger.info('✅ Successfully seeded categories, vendors, and multi-transaction listings!');
  } catch (err) {
    logger.error(`Failed to seed database: ${err.message}`);
    throw err;
  }
};
