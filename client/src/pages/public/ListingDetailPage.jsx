import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Store
} from 'lucide-react';
import { catalogApi } from '../../api/catalogApi.js';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';

export const ListingDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Fetch listing data by slug
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['listing', slug],
    queryFn: () => catalogApi.getListingBySlug(slug)
  });

  const listing = response?.data;

  if (isLoading) {
    return <LoadingSpinner text="Loading listing specifications..." fullPage />;
  }

  if (error || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-3xl font-bold text-stone-900 mb-4">Listing Not Found</h2>
        <p className="text-sm text-stone-600 mb-6">
          The wedding item or service you are looking for may have been archived or moved.
        </p>
        <Link to="/catalog">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const mediaList = listing.media?.length ? listing.media : [{ url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80' }];
  const currentImage = mediaList[selectedImageIndex]?.url || mediaList[0].url;

  // Calculate rental duration if dates chosen
  let rentalDays = 1;
  let rentalTotal = 0;
  if (rentalStartDate && rentalEndDate) {
    const start = new Date(rentalStartDate);
    const end = new Date(rentalEndDate);
    if (end > start) {
      rentalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      rentalTotal = listing.pricing.basePrice * rentalDays * quantity;
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setIsAdding(true);
      setActionMessage(null);

      if (listing.transactionType === 'RENT') {
        if (!rentalStartDate || !rentalEndDate) {
          setActionMessage({ type: 'error', text: 'Please select rental start and end dates.' });
          setIsAdding(false);
          return;
        }
      }

      await addToCart({
        listingId: listing._id,
        transactionType: listing.transactionType,
        quantity,
        rentalStartDate: listing.transactionType === 'RENT' ? rentalStartDate : null,
        rentalEndDate: listing.transactionType === 'RENT' ? rentalEndDate : null
      });

      setActionMessage({ type: 'success', text: 'Added to your wedding cart!' });
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err?.message || 'Could not add item to cart. Please check availability.'
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Category Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
        <Link to="/" className="hover:text-maroon-900">Home</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-maroon-900">Catalog</Link>
        <span>/</span>
        <Link to={`/catalog?category=${listing.categoryId?.slug}`} className="hover:text-maroon-900">
          {listing.categoryId?.name}
        </Link>
        <span>/</span>
        <span className="text-stone-800 font-medium truncate max-w-xs">{listing.title}</span>
      </nav>

      {/* Main Grid: Gallery + Details & Checkout Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-ivory-200 shadow-sm relative">
            <img
              src={currentImage}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant={listing.transactionType} size="md">
                {listing.transactionType.replace('_', ' ')}
              </Badge>
              {listing.usedItemCondition?.condition && (
                <Badge variant="gold" size="md">
                  Condition: {listing.usedItemCondition.condition}
                </Badge>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {mediaList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {mediaList.map((media, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-maroon-900 scale-105' : 'border-ivory-300 opacity-70'
                  }`}
                >
                  <img src={media.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description Section */}
          <div className="bg-white rounded-2xl border border-ivory-200 p-6 sm:p-8 space-y-6 mt-6">
            <h3 className="font-serif text-2xl font-bold text-stone-900">About this Listing</h3>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>

            {/* Inclusions & Exclusions for Services */}
            {listing.transactionType === 'BOOK_SERVICE' && listing.serviceDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-ivory-200">
                {listing.serviceDetails.inclusions?.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Package Inclusions</span>
                    </h4>
                    <ul className="text-xs text-stone-600 space-y-1">
                      {listing.serviceDetails.inclusions.map((inc, i) => (
                        <li key={i}>• {inc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {listing.serviceDetails.exclusions?.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase font-bold text-rose-800 mb-2 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Exclusions</span>
                    </h4>
                    <ul className="text-xs text-stone-600 space-y-1">
                      {listing.serviceDetails.exclusions.map((exc, i) => (
                        <li key={i}>• {exc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Booking & Vendor Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Action Box */}
          <div className="bg-white rounded-2xl border border-ivory-200 p-6 sm:p-8 shadow-wedding space-y-6 sticky top-28">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Serviceable in: {listing.serviceableCities?.join(', ')}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
                {listing.title}
              </h1>
            </div>

            {/* Pricing Section */}
            <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200">
              <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-1">
                Base Price
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-maroon-900">
                  ₹{listing.pricing?.basePrice?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-600">
                  /{listing.pricing?.priceUnit?.replace('per_', '')}
                </span>
              </div>

              {listing.pricing?.securityDeposit > 0 && (
                <div className="mt-2 text-xs text-amber-800 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Refundable Security Deposit: ₹{listing.pricing.securityDeposit.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* TRANSACTION SPECIFIC ACTION INPUTS */}
            {listing.transactionType === 'RENT' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-stone-500 mb-1">
                      Rental Start Date
                    </label>
                    <input
                      type="date"
                      value={rentalStartDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setRentalStartDate(e.target.value)}
                      className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-stone-500 mb-1">
                      Rental End Date
                    </label>
                    <input
                      type="date"
                      value={rentalEndDate}
                      min={rentalStartDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setRentalEndDate(e.target.value)}
                      className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800"
                    />
                  </div>
                </div>

                {rentalStartDate && rentalEndDate && (
                  <div className="text-xs text-stone-600 bg-ivory-50 p-3 rounded-lg border border-ivory-200 flex justify-between">
                    <span>Duration: <strong>{rentalDays} day(s)</strong></span>
                    <span>Subtotal: <strong className="text-maroon-900">₹{rentalTotal.toLocaleString('en-IN')}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Quantity selector for RENT / BUY_NEW */}
            {listing.transactionType !== 'BUY_USED' && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-stone-700">Quantity Needed:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg border border-ivory-300 bg-white font-bold hover:bg-ivory-100"
                  >
                    -
                  </button>
                  <span className="font-semibold text-stone-900 w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-ivory-300 bg-white font-bold hover:bg-ivory-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Notification message */}
            {actionMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  actionMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {actionMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{actionMessage.text}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                isLoading={isAdding}
                onClick={handleAddToCart}
                className="w-full shadow-md"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {listing.transactionType === 'RENT'
                  ? 'Reserve for Rental'
                  : listing.transactionType === 'BOOK_SERVICE'
                  ? 'Request Booking'
                  : 'Add to Cart'}
              </Button>

              <Link to="/cart">
                <Button variant="outline" size="md" className="w-full mt-2">
                  View Shopping Cart
                </Button>
              </Link>
            </div>
          </div>

          {/* Vendor Details Card */}
          {listing.vendorId && (
            <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-maroon-100 text-maroon-900 flex items-center justify-center font-bold text-lg">
                  {listing.vendorId.businessName?.charAt(0) || 'V'}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-stone-900 flex items-center gap-1.5">
                    <span>{listing.vendorId.businessName}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </h4>
                  <span className="text-xs text-stone-500">Verified Marketplace Partner</span>
                </div>
              </div>

              <div className="text-xs text-stone-600 space-y-1.5 pt-2 border-t border-ivory-100">
                <div className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-stone-400" />
                  <span>Serviceable Area: {listing.serviceableCities?.join(', ')}</span>
                </div>
                {listing.vendorId.supportEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{listing.vendorId.supportEmail}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
