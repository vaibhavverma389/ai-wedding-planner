import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  Camera,
  Music,
  Users,
  Award,
  Star
} from 'lucide-react';
import { catalogApi } from '../../api/catalogApi.js';
import { ListingCard } from '../../components/common/ListingCard.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Button } from '../../components/common/Button.jsx';

export const HomePage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [transactionType, setTransactionType] = useState('');

  // Fetch real categories from MongoDB
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories()
  });

  // Fetch real featured listings from MongoDB
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['featuredListings'],
    queryFn: () => catalogApi.getListings({ limit: 8, sort: 'popular' })
  });

  const categories = categoriesData?.data || [];
  const listings = listingsData?.data?.listings || [];

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('q', keyword.trim());
    if (city) params.append('city', city);
    if (transactionType) params.append('type', transactionType);
    navigate(`/catalog?${params.toString()}`);
  };

  const indianCities = [
    'Delhi NCR',
    'Mumbai',
    'Jaipur',
    'Udaipur',
    'Bangalore',
    'Lucknow',
    'Chandigarh',
    'Hyderabad'
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-ivory-100 via-ivory-50 to-white pt-12 pb-20 border-b border-ivory-200 overflow-hidden">
        {/* Subtle decorative gold sparkles */}
        <div className="absolute top-10 left-10 text-gold-300 opacity-60">
          <Sparkles className="w-16 h-16 animate-pulse" />
        </div>
        <div className="absolute top-20 right-10 text-gold-300 opacity-60">
          <Sparkles className="w-20 h-20 animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Tagline Badge */}
          <div className="inline-flex items-center gap-2 bg-maroon-50 border border-maroon-200 text-maroon-900 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <span className="text-gold-600 font-bold">✨ Bharat’s Complete Wedding Ecosystem</span>
          </div>

          {/* Grand Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-stone-900 tracking-tight leading-[1.15] max-w-4xl mx-auto mb-6">
            Plan Your Grand Wedding With <span className="text-maroon-900 italic">ShaadiSaathi</span>
          </h1>

          <p className="text-base sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            Discover verified vendors, rent regal mandaps & equipment, buy handcrafted wedding essentials, and book premier ceremony services across India.
          </p>

          {/* Unified Discovery Search Card */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-wedding-lg border border-ivory-200 p-4 sm:p-6 text-left">
            {/* Quick Transaction Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-ivory-200 text-xs font-medium">
              <span className="text-stone-400 font-semibold mr-1">I want to:</span>
              {[
                { label: 'All Celebrations', val: '' },
                { label: 'Rent Setup & Cars', val: 'RENT' },
                { label: 'Buy New Essentials', val: 'BUY_NEW' },
                { label: 'Pre-Loved Deals', val: 'BUY_USED' },
                { label: 'Book Services', val: 'BOOK_SERVICE' }
              ].map((pill) => (
                <button
                  key={pill.val}
                  type="button"
                  onClick={() => setTransactionType(pill.val)}
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    transactionType === pill.val
                      ? 'bg-maroon-900 text-white shadow-sm font-semibold'
                      : 'bg-ivory-100 text-stone-700 hover:bg-ivory-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Keyword Search */}
              <div className="sm:col-span-5 relative">
                <label className="block text-[11px] uppercase font-bold text-stone-400 mb-1">
                  What are you looking for?
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Royal Mandap, Catering, Lehengas..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800 focus:bg-white"
                  />
                </div>
              </div>

              {/* City Selection */}
              <div className="sm:col-span-4 relative">
                <label className="block text-[11px] uppercase font-bold text-stone-400 mb-1">
                  Wedding Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-8 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800 focus:bg-white appearance-none"
                  >
                    {indianCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Submit Button */}
              <div className="sm:col-span-3 sm:pt-5">
                <Button type="submit" variant="primary" size="lg" className="w-full shadow-md">
                  Explore Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. FOUR TRANSACTION TYPES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
            One Platform, Four Ways to Celebrate
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            From flexible rentals and verified retail to pre-loved sustainable fashion and top wedding artists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: RENT */}
          <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-sm hover:shadow-wedding-lg transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Flexible Rental
            </span>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-2 mb-2">Rent Equipment & Decor</h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Mandaps, lighting sets, sound systems, luxury cars, and seating arrangements booked for exact event dates.
            </p>
            <Link
              to="/catalog?type=RENT"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
            >
              Browse Rentals <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: BUY NEW */}
          <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-sm hover:shadow-wedding-lg transition-all group">
            <div className="w-12 h-12 rounded-xl bg-maroon-50 text-maroon-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-maroon-800 bg-maroon-50 px-2 py-0.5 rounded">
              Retail Essentials
            </span>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-2 mb-2">Buy Brand New</h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Handcrafted favors, return gifts, invitation suites, ceremony essentials, and bridal jewelry delivered to your doorstep.
            </p>
            <Link
              to="/catalog?type=BUY_NEW"
              className="inline-flex items-center gap-1 text-xs font-semibold text-maroon-900 hover:text-maroon-950"
            >
              Shop Essentials <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: BUY USED */}
          <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-sm hover:shadow-wedding-lg transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Pre-Loved Luxury
            </span>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-2 mb-2">Buy Verified Pre-Owned</h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Designer lehengas, sherwanis, and props verified for condition with full defect disclosure and smart pricing.
            </p>
            <Link
              to="/catalog?type=BUY_USED"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:text-amber-950"
            >
              Explore Pre-Loved <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: BOOK SERVICES */}
          <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-sm hover:shadow-wedding-lg transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
              Tailored Services
            </span>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-2 mb-2">Book Wedding Artists</h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Caterers, photographers, pandits, mehendi artists, DJs, and planners with milestone quotations and verified reviews.
            </p>
            <Link
              to="/catalog?type=BOOK_SERVICE"
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-900 hover:text-purple-950"
            >
              Book Professionals <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. WEDDING CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 pb-4 border-b border-ivory-200">
          <div>
            <h2 className="font-serif text-3xl font-bold text-stone-900">Explore by Category</h2>
            <p className="text-xs text-stone-500 mt-1">Browse specialized vendors and listings by ceremony</p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-semibold text-maroon-900 hover:text-gold-700 transition-colors inline-flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {categoriesLoading ? (
          <LoadingSpinner text="Loading wedding categories..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/catalog?category=${cat.slug}`}
                className="group bg-white rounded-xl border border-ivory-200 p-5 text-center hover:shadow-wedding transition-all duration-300 flex flex-col items-center justify-center hover:border-gold-400"
              >
                <div className="w-12 h-12 rounded-full bg-ivory-100 group-hover:bg-maroon-50 text-maroon-900 flex items-center justify-center mb-3 transition-colors text-xl">
                  💍
                </div>
                <h4 className="font-medium text-sm text-stone-900 group-hover:text-maroon-900 transition-colors line-clamp-1">
                  {cat.name}
                </h4>
                <span className="text-[11px] text-stone-400 mt-1">
                  {cat.subcategories?.length ? `${cat.subcategories.length} sub-types` : 'Featured'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. FEATURED LISTINGS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 pb-4 border-b border-ivory-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Demonstrations</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-stone-900">Popular on ShaadiSaathi</h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-semibold text-maroon-900 hover:text-gold-700 transition-colors inline-flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>Explore All ({listings.length} Available)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {listingsLoading ? (
          <LoadingSpinner text="Fetching verified wedding listings..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <ListingCard key={item._id} listing={item} />
            ))}
          </div>
        )}
      </section>

      {/* 5. VENDOR PARTNERSHIP CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-maroon-950 via-maroon-900 to-stone-900 rounded-3xl p-8 sm:p-14 text-white overflow-hidden shadow-wedding-lg">
          <div className="absolute right-0 top-0 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase font-bold tracking-widest text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/20">
              For Vendors & Wedding Professionals
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold mt-4 mb-4 leading-tight">
              Grow Your Wedding Business Across India
            </h2>
            <p className="text-sm text-ivory-200 mb-8 leading-relaxed">
              Register as a verified ShaadiSaathi partner. Publish your decor inventory, rental fleet, or ceremony services to reach couples planning their dream weddings.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register?role=vendor">
                <Button variant="gold" size="lg">
                  Join as Vendor Partner
                </Button>
              </Link>
              <Link to="/vendors">
                <Button variant="secondary" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  Explore Vendor Directory
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
