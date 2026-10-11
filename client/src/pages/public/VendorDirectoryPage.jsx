import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Store, ShieldCheck, MapPin, Mail, Phone, Star, Search, ArrowRight } from 'lucide-react';
import { apiClient } from '../../api/client.js';
import { Button } from '../../components/common/Button.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Badge } from '../../components/common/Badge.jsx';

export const VendorDirectoryPage = () => {
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch vendors from catalog listings or vendors endpoint
  const { data: listingsData, isLoading } = useQuery({
    queryKey: ['vendorsList'],
    queryFn: () => apiClient.get('/listings?limit=50')
  });

  const listings = listingsData?.data?.listings || [];

  // Extract unique vendors from listings
  const vendorMap = new Map();
  listings.forEach((item) => {
    if (item.vendorId && item.vendorId._id) {
      if (!vendorMap.has(item.vendorId._id)) {
        vendorMap.set(item.vendorId._id, {
          ...item.vendorId,
          sampleListingTitle: item.title,
          categoryName: item.categoryId?.name,
          city: item.serviceableCities?.[0] || 'Delhi NCR'
        });
      }
    }
  });

  const allVendors = Array.from(vendorMap.values());

  const filteredVendors = allVendors.filter((v) => {
    const matchCity = !cityFilter || v.city === cityFilter || v.serviceableCities?.includes(cityFilter);
    const matchSearch =
      !searchQuery ||
      v.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCity && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
          Verified Wedding Vendors Directory
        </h1>
        <p className="text-sm text-stone-600">
          Discover certified Indian wedding professionals, decorators, caterers, and equipment suppliers.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search vendor by name or ceremony category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-800"
          />
        </div>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="w-full sm:w-auto bg-ivory-50 border border-ivory-300 rounded-xl px-4 py-2 text-sm text-stone-800"
        >
          <option value="">All Regions</option>
          <option value="Delhi NCR">Delhi NCR</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Jaipur">Jaipur</option>
          <option value="Bangalore">Bangalore</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading verified vendor network..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor._id}
              className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-sm hover:shadow-wedding-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-maroon-100 text-maroon-900 flex items-center justify-center font-bold text-lg">
                    {vendor.businessName?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-lg flex items-center gap-1.5">
                      <span>{vendor.businessName}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    </h3>
                    <span className="text-xs text-stone-500 font-medium">
                      {vendor.categoryName || 'Wedding Specialist'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                  {vendor.description || `Specialist partner providing premier setups for Indian weddings and special celebrations.`}
                </p>

                <div className="space-y-1.5 text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{vendor.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-stone-400" />
                    <span>Sample: {vendor.sampleListingTitle}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-ivory-100 mt-6 flex items-center justify-between">
                <Badge variant="success" size="sm">
                  Verified Partner
                </Badge>
                <Link
                  to={`/catalog?q=${encodeURIComponent(vendor.businessName)}`}
                  className="text-xs font-semibold text-maroon-900 hover:text-gold-700 flex items-center gap-1"
                >
                  View Listings <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
