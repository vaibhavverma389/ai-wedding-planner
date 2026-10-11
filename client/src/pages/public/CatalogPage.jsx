import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, SlidersHorizontal, Search, RefreshCw, X } from 'lucide-react';
import { catalogApi } from '../../api/catalogApi.js';
import { ListingCard } from '../../components/common/ListingCard.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Button } from '../../components/common/Button.jsx';

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || '';
  const categoryParam = searchParams.get('category') || '';
  const cityParam = searchParams.get('city') || '';
  const sortParam = searchParams.get('sort') || 'popular';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [keywordInput, setKeywordInput] = useState(queryParam);
  const [selectedType, setSelectedType] = useState(typeParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [page, setPage] = useState(pageParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setKeywordInput(queryParam);
    setSelectedType(typeParam);
    setSelectedCategory(categoryParam);
    setSelectedCity(cityParam);
    setSelectedSort(sortParam);
    setPage(pageParam);
  }, [queryParam, typeParam, categoryParam, cityParam, sortParam, pageParam]);

  // Fetch categories for sidebar filter
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories()
  });

  // Query catalog listings
  const { data: listingsData, isLoading, refetch } = useQuery({
    queryKey: ['catalogListings', queryParam, typeParam, categoryParam, cityParam, sortParam, page],
    queryFn: () =>
      catalogApi.getListings({
        q: queryParam || undefined,
        transactionType: typeParam || undefined,
        categorySlug: categoryParam || undefined,
        city: cityParam || undefined,
        sort: sortParam,
        page,
        limit: 12
      })
  });

  const categories = categoriesData?.data || [];
  const listings = listingsData?.data?.listings || [];
  const pagination = listingsData?.data?.pagination || { total: 0, totalPages: 1 };

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val) {
        updated.set(key, val);
      } else {
        updated.delete(key);
      }
    });
    updated.set('page', '1');
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ q: keywordInput });
  };

  const handleClearFilters = () => {
    setKeywordInput('');
    setSelectedType('');
    setSelectedCategory('');
    setSelectedCity('');
    setSelectedSort('popular');
    setSearchParams({});
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
          Browse Wedding Marketplace
        </h1>
        <p className="text-sm text-stone-600">
          Showing {pagination.total} verified listings across India
        </p>
      </div>

      {/* Main Grid: Filters Sidebar + Listings Result */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-ivory-200 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-ivory-200">
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-maroon-800" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-xs text-stone-500 hover:text-maroon-900 font-medium"
            >
              Reset All
            </button>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label className="block text-xs uppercase font-bold text-stone-500 mb-3 tracking-wider">
              Transaction Mode
            </label>
            <div className="space-y-2 text-sm">
              {[
                { label: 'All Listings', value: '' },
                { label: 'For Rent', value: 'RENT' },
                { label: 'Buy Brand New', value: 'BUY_NEW' },
                { label: 'Pre-Loved / Used', value: 'BUY_USED' },
                { label: 'Book Services', value: 'BOOK_SERVICE' }
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-stone-700 hover:text-maroon-900">
                  <input
                    type="radio"
                    name="desktopType"
                    checked={selectedType === opt.value}
                    onChange={() => updateFilters({ type: opt.value })}
                    className="accent-maroon-900"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="pt-4 border-t border-ivory-100">
            <label className="block text-xs uppercase font-bold text-stone-500 mb-3 tracking-wider">
              Category
            </label>
            <div className="space-y-2 text-sm max-h-56 overflow-y-auto pr-1">
              <label className="flex items-center gap-2 cursor-pointer text-stone-700 hover:text-maroon-900">
                <input
                  type="radio"
                  name="desktopCategory"
                  checked={!selectedCategory}
                  onChange={() => updateFilters({ category: '' })}
                  className="accent-maroon-900"
                />
                <span>All Categories</span>
              </label>
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-2 cursor-pointer text-stone-700 hover:text-maroon-900">
                  <input
                    type="radio"
                    name="desktopCategory"
                    checked={selectedCategory === cat.slug}
                    onChange={() => updateFilters({ category: cat.slug })}
                    className="accent-maroon-900"
                  />
                  <span className="truncate">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* City / Service Area Filter */}
          <div className="pt-4 border-t border-ivory-100">
            <label className="block text-xs uppercase font-bold text-stone-500 mb-3 tracking-wider">
              Service Location
            </label>
            <select
              value={selectedCity}
              onChange={(e) => updateFilters({ city: e.target.value })}
              className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800"
            >
              <option value="">All Service Cities</option>
              {indianCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* LISTINGS RESULTS COLUMN */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Search Row */}
          <div className="bg-white p-4 rounded-2xl border border-ivory-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search catalog listings..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-16 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800"
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 text-xs font-semibold text-maroon-900 hover:underline px-2 py-1"
              >
                Search
              </button>
            </form>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-stone-500 font-medium">Sort By:</span>
              <select
                value={selectedSort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-1.5 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800"
              >
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Listings Content */}
          {isLoading ? (
            <LoadingSpinner text="Searching ShaadiSaathi catalog..." />
          ) : listings.length === 0 ? (
            <EmptyState
              title="No Listings Match Your Filters"
              description="Try resetting your transaction type or choosing a different city to see available items."
              actionText="Reset Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item) => (
                  <ListingCard key={item._id} listing={item} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => {
                      const next = Math.max(1, page - 1);
                      updateFilters({ page: next.toString() });
                    }}
                  >
                    Previous
                  </Button>

                  <span className="text-xs text-stone-600 px-3">
                    Page <strong className="text-stone-900">{page}</strong> of{' '}
                    <strong>{pagination.totalPages}</strong>
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => {
                      const next = Math.min(pagination.totalPages, page + 1);
                      updateFilters({ page: next.toString() });
                    }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
