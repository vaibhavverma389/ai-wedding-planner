import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert,
  Users,
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  Building,
  Layers,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../api/client.js';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';

export const AdminDashboardPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors', 'listings'

  // Query platform analytics
  const { data: analyticsRes, isLoading: analyticsLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => apiClient.get('/admin/analytics')
  });

  // Query vendors list
  const { data: vendorsRes, isLoading: vendorsLoading } = useQuery({
    queryKey: ['adminVendors'],
    queryFn: () => apiClient.get('/admin/vendors')
  });

  // Query all listings for moderation
  const { data: listingsRes, isLoading: listingsLoading } = useQuery({
    queryKey: ['adminListings'],
    queryFn: () => apiClient.get('/listings?limit=50')
  });

  const analytics = analyticsRes?.data;
  const vendors = vendorsRes?.data?.vendors || [];
  const listings = listingsRes?.data?.listings || [];

  // Vendor verification mutation
  const updateVendorStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      apiClient.patch(`/admin/vendors/${id}/status`, { verificationStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminVendors', 'adminAnalytics']);
    }
  });

  // Listing moderation mutation
  const moderateListingMutation = useMutation({
    mutationFn: ({ id, status }) =>
      apiClient.patch(`/admin/listings/${id}/moderation`, {
        status,
        moderationNotes: 'Reviewed by platform administrator'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminListings', 'adminAnalytics']);
    }
  });

  if (analyticsLoading || vendorsLoading) {
    return <LoadingSpinner text="Loading platform administration data..." fullPage />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Platform Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-purple-950 text-white rounded-3xl p-6 sm:p-10 shadow-wedding-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-purple-300 font-bold mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Platform Administration & Compliance</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            ShaadiSaathi SuperAdmin Portal
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Global marketplace governance, vendor verification audits, and revenue oversight.
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-ivory-200 shadow-sm">
          <div className="text-xs text-stone-500 font-semibold mb-1">Total GMV Processed</div>
          <div className="text-2xl font-bold text-maroon-900">
            ₹{analytics?.grossMerchandiseValue?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">{analytics?.totalPaidOrders} Paid Orders</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-200 shadow-sm">
          <div className="text-xs text-stone-500 font-semibold mb-1">Platform Commissions</div>
          <div className="text-2xl font-bold text-emerald-700">
            ₹{analytics?.totalPlatformCommissions?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Net platform revenue</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-200 shadow-sm">
          <div className="text-xs text-stone-500 font-semibold mb-1">Registered Users</div>
          <div className="text-2xl font-bold text-stone-900">{analytics?.totalUsers}</div>
          <div className="text-[11px] text-stone-400 mt-1">
            {analytics?.totalCustomers} Couples • {analytics?.totalVendors} Vendors
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-200 shadow-sm">
          <div className="text-xs text-stone-500 font-semibold mb-1">Pending Approvals</div>
          <div className="text-2xl font-bold text-amber-600">
            {analytics?.pendingVendorApprovals} Vendors
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Requires compliance audit</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ivory-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'vendors'
              ? 'border-purple-900 text-purple-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Vendor Account Approvals ({vendors.length})
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'listings'
              ? 'border-purple-900 text-purple-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Catalog Listings Moderation ({listings.length})
        </button>
      </div>

      {/* TAB 1: VENDORS VERIFICATION */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-2xl border border-ivory-200 overflow-hidden shadow-sm p-6 space-y-4">
          <h3 className="font-serif text-lg font-bold text-stone-900">Registered Vendor Accounts</h3>
          <div className="divide-y divide-ivory-100">
            {vendors.map((v) => (
              <div key={v._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{v.businessName}</span>
                    <Badge variant={v.verificationStatus === 'verified' ? 'success' : 'warning'} size="sm">
                      {v.verificationStatus}
                    </Badge>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    User: {v.userId?.name} ({v.userId?.email}) • Regions: {v.serviceableCities?.join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {v.verificationStatus !== 'verified' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateVendorStatusMutation.mutate({ id: v._id, status: 'verified' })}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve & Verify
                    </Button>
                  )}
                  {v.verificationStatus !== 'rejected' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => updateVendorStatusMutation.mutate({ id: v._id, status: 'rejected' })}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LISTINGS MODERATION */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-ivory-200 overflow-hidden shadow-sm p-6 space-y-4">
          <h3 className="font-serif text-lg font-bold text-stone-900">Catalog Moderation Queue</h3>
          <div className="divide-y divide-ivory-100">
            {listings.map((l) => (
              <div key={l._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{l.title}</span>
                    <Badge variant={l.transactionType} size="sm">
                      {l.transactionType}
                    </Badge>
                    <Badge variant={l.status === 'published' ? 'success' : 'warning'} size="sm">
                      {l.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Vendor: {l.vendorId?.businessName} • Base Price: ₹{l.pricing?.basePrice?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {l.status !== 'published' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => moderateListingMutation.mutate({ id: l._id, status: 'published' })}
                    >
                      Publish
                    </Button>
                  )}
                  {l.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moderateListingMutation.mutate({ id: l._id, status: 'rejected' })}
                    >
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
