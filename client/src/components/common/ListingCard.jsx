import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from './Badge.jsx';

export const ListingCard = ({ listing }) => {
  if (!listing) return null;

  const primaryImage = listing.media?.[0]?.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';
  const vendorName = listing.vendorId?.businessName || 'Verified Shaadi Partner';
  const price = listing.pricing?.basePrice?.toLocaleString('en-IN') || '0';
  const priceUnit = listing.pricing?.priceUnit?.replace('per_', '/') || '';
  const city = listing.serviceableCities?.[0] || 'Pan India';

  const transactionLabelMap = {
    RENT: 'For Rent',
    BUY_NEW: 'Buy New',
    BUY_USED: 'Pre-Loved',
    BOOK_SERVICE: 'Service'
  };

  return (
    <div className="group bg-white rounded-2xl border border-ivory-200 overflow-hidden shadow-sm hover:shadow-wedding-lg transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Media & Transaction Tag */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={primaryImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <Badge variant={listing.transactionType} size="sm">
            {transactionLabelMap[listing.transactionType] || listing.transactionType}
          </Badge>
          {listing.usedItemCondition?.condition && (
            <Badge variant="gold" size="sm">
              {listing.usedItemCondition.condition.replace('_', ' ')}
            </Badge>
          )}
        </div>

        {/* Security deposit badge if rental */}
        {listing.transactionType === 'RENT' && listing.pricing?.securityDeposit > 0 && (
          <div className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-sm text-ivory-100 text-[10px] px-2 py-0.5 rounded font-medium">
            Deposit: ₹{listing.pricing.securityDeposit.toLocaleString('en-IN')}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Vendor & Location info */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="inline-flex items-center gap-1 font-medium text-maroon-800 truncate max-w-[65%]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{vendorName}</span>
            </span>
            <span className="inline-flex items-center gap-0.5 text-stone-500">
              <MapPin className="w-3 h-3 text-stone-400" />
              <span>{city}</span>
            </span>
          </div>

          {/* Title */}
          <Link to={`/listings/${listing.slug}`}>
            <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-maroon-800 transition-colors line-clamp-2 mb-2 leading-snug">
              {listing.title}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
            {listing.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-ivory-200 flex items-center justify-between mt-auto">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
              {listing.pricing?.customQuotationOnly ? 'Custom Quote' : 'Starting From'}
            </div>
            <div className="text-lg font-bold text-maroon-900 flex items-baseline gap-1">
              {listing.pricing?.customQuotationOnly ? (
                <span className="text-sm font-semibold text-stone-700">On Request</span>
              ) : (
                <>
                  <span>₹{price}</span>
                  {priceUnit && <span className="text-xs font-normal text-stone-500">{priceUnit}</span>}
                </>
              )}
            </div>
          </div>

          <Link
            to={`/listings/${listing.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 group-hover:text-maroon-800 transition-colors bg-gold-50 group-hover:bg-maroon-50 px-3 py-2 rounded-lg"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
