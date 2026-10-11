import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store,
  DollarSign,
  Package,
  Calendar,
  ShieldCheck,
  Plus,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../../api/client.js';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';

export const VendorDashboardPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'listings'
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Listing Form State
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    categoryId: '',
    transactionType: 'RENT',
    basePrice: 10000,
    priceUnit: 'per_day',
    securityDeposit: 5000,
    stockQuantity: 2,
    serviceableCities: ['Delhi NCR']
  });

  // Query analytics and vendor orders
  const { data: analyticsRes, isLoading: analyticsLoading } = useQuery({
    queryKey: ['vendorAnalytics'],
    queryFn: () => apiClient.get('/vendors/dashboard/analytics')
  });

  const { data: ordersRes, isLoading: ordersLoading } = useQuery({
    queryKey: ['vendorOrders'],
    queryFn: () => apiClient.get('/orders/vendor/orders')
  });

  const { data: listingsRes, isLoading: listingsLoading } = useQuery({
    queryKey: ['vendorListings'],
    queryFn: () => apiClient.get('/listings/my/listings')
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/categories')
  });

  const analytics = analyticsRes?.data?.analytics;
  const vendor = analyticsRes?.data?.vendor;
  const orders = ordersRes?.data?.orders || [];
  const listings = listingsRes?.data?.listings || [];
  const categories = categoriesRes?.data || [];

  // Fulfillment update mutation
  const updateFulfillmentMutation = useMutation({
    mutationFn: ({ orderId, status }) =>
      apiClient.patch(`/orders/${orderId}/fulfillment`, { fulfillmentStatus: status }),
    onSuccess: () => queryClient.invalidateQueries(['vendorOrders'])
  });

  // Rental Deposit Return mutation
  const returnDepositMutation = useMutation({
    mutationFn: ({ orderId, deduction, reason }) =>
      apiClient.post(`/orders/${orderId}/return-deposit`, { damageDeduction: deduction, deductionReason: reason }),
    onSuccess: () => queryClient.invalidateQueries(['vendorOrders', 'vendorAnalytics'])
  });

  // Create Listing mutation
  const createListingMutation = useMutation({
    mutationFn: (data) =>
      apiClient.post('/listings', {
        ...data,
        pricing: {
          basePrice: data.basePrice,
          priceUnit: data.priceUnit,
          securityDeposit: data.securityDeposit
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendorListings', 'vendorAnalytics']);
      setShowCreateModal(false);
    }
  });

  if (analyticsLoading || ordersLoading) {
    return <LoadingSpinner text="Loading vendor storefront analytics..." fullPage />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-ivory-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-maroon-100 text-maroon-900 flex items-center justify-center font-bold text-2xl">
            {vendor?.businessName?.charAt(0) || 'V'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {vendor?.businessName || 'My Vendor Portal'}
              </h1>
              <Badge variant={vendor?.verificationStatus === 'verified' ? 'success' : 'warning'} size="sm">
                {vendor?.verificationStatus}
              </Badge>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Service Regions: {vendor?.serviceableCities?.join(', ') || 'All Regions'}
            </p>
          </div>
        </div>

        <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Publish New Listing
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-ivory-200 shadow-sm">
          <div className="text-xs text-stone-500 font-semibold mb-1">Total Payouts</div>
          <div className="text-2xl font-bold text-maroon-900">
            ₹{analytics?.totalEarnings?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Earned net commission</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-200 shadow-sm">
          <div className="text-xs text-stone-500 font-semibold mb-1">Customer Orders</div>
          <div className="text-2xl font-bold text-stone-900">{analytics?.totalOrders}</div>
          <div className="text-[11px] text-stone-400 mt-1">
            {analytics?.paidOrdersCount} Confirmed & Paid
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-200 shadow-sm">
          <div className="text-xs text-stone-500 font-semibold mb-1">Pending Fulfillment</div>
          <div className="text-2xl font-bold text-amber-700">
            {analytics?.pendingFulfillmentCount} Orders
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Ready for dispatch/setup</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-200 shadow-sm">
          <div className="text-xs text-stone-500 font-semibold mb-1">Active Store Listings</div>
          <div className="text-2xl font-bold text-stone-900">{analytics?.totalListings}</div>
          <div className="text-[11px] text-stone-400 mt-1">
            {analytics?.publishedListings} Published
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-ivory-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-maroon-900 text-maroon-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Customer Orders & Dispatch ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'listings'
              ? 'border-maroon-900 text-maroon-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          My Store Catalog Listings ({listings.length})
        </button>
      </div>

      {/* TAB 1: ORDERS FULFILLMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-ivory-200 text-stone-500">
              No orders received yet. Once customers checkout your listings, they will appear here.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-ivory-100">
                  <div>
                    <span className="font-serif font-bold text-stone-900">
                      Order #{order.orderNumber}
                    </span>
                    <span className="ml-2 text-xs text-stone-400">
                      Customer: {order.customerId?.name} ({order.customerId?.phone})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" size="sm">
                      Fulfillment: {order.fulfillmentStatus}
                    </Badge>
                    <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 text-xs">
                  {order.items?.map((item) => (
                    <div key={item._id} className="flex justify-between items-center bg-ivory-50 p-2.5 rounded-lg">
                      <div>
                        <span className="font-semibold text-stone-900">{item.title}</span>
                        <span className="ml-2 text-stone-400">({item.transactionType}) × {item.quantity}</span>
                      </div>
                      <span className="font-bold text-stone-900">
                        ₹{item.lineSubtotal?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Logistics Controls */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="text-stone-500">
                    Net Vendor Payout: <strong className="text-maroon-900">₹{order.pricing?.vendorPayoutAmount?.toLocaleString('en-IN')}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.fulfillmentStatus === 'CONFIRMED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          updateFulfillmentMutation.mutate({ orderId: order._id, status: 'DISPATCHED' })
                        }
                      >
                        <Truck className="w-3.5 h-3.5 mr-1" /> Mark Dispatched
                      </Button>
                    )}

                    {order.fulfillmentStatus === 'DISPATCHED' && (
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() =>
                          updateFulfillmentMutation.mutate({ orderId: order._id, status: 'DELIVERED' })
                        }
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Delivered
                      </Button>
                    )}

                    {/* Rental return inspection */}
                    {order.rentalTracking?.depositRefundStatus === 'HELD' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const deduction = Number(prompt('Enter damage deduction in INR (0 for full refund):', '0') || 0);
                          returnDepositMutation.mutate({
                            orderId: order._id,
                            deduction,
                            reason: deduction > 0 ? 'Damage fee deduction' : 'Inspection complete'
                          });
                        }}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Settle Rental Deposit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: MY LISTINGS */}
      {activeTab === 'listings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l) => (
            <div key={l._id} className="bg-white rounded-2xl border border-ivory-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={l.transactionType} size="sm">
                  {l.transactionType}
                </Badge>
                <Badge variant={l.status === 'published' ? 'success' : 'warning'} size="sm">
                  {l.status}
                </Badge>
              </div>
              <h4 className="font-serif font-bold text-stone-900 line-clamp-1">{l.title}</h4>
              <p className="text-xs text-stone-500 line-clamp-2">{l.description}</p>
              <div className="pt-2 border-t border-ivory-100 flex justify-between items-center text-xs">
                <span className="font-bold text-maroon-900">
                  ₹{l.pricing?.basePrice?.toLocaleString('en-IN')} / {l.pricing?.priceUnit}
                </span>
                <span className="text-stone-400">Stock: {l.stockQuantity}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: CREATE LISTING */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-wedding-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-2xl font-bold text-stone-900">Create New Listing</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createListingMutation.mutate(newListing);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-stone-500 mb-1">Listing Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Brass Mandap Setup"
                  value={newListing.title}
                  onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-sm text-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-500 mb-1">Transaction Mode</label>
                <select
                  value={newListing.transactionType}
                  onChange={(e) => setNewListing({ ...newListing, transactionType: e.target.value })}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-sm text-stone-800"
                >
                  <option value="RENT">Rental Equipment / Car</option>
                  <option value="BUY_NEW">Buy Brand New Product</option>
                  <option value="BUY_USED">Buy Pre-Loved / Used</option>
                  <option value="BOOK_SERVICE">Book Service (Catering/Photography/DJ)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-500 mb-1">Category</label>
                <select
                  required
                  value={newListing.categoryId}
                  onChange={(e) => setNewListing({ ...newListing, categoryId: e.target.value })}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-sm text-stone-800"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-500 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newListing.basePrice}
                    onChange={(e) => setNewListing({ ...newListing, basePrice: Number(e.target.value) })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-sm text-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-500 mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={newListing.securityDeposit}
                    onChange={(e) => setNewListing({ ...newListing, securityDeposit: Number(e.target.value) })}
                    className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-sm text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-sm text-stone-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Publish Listing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
