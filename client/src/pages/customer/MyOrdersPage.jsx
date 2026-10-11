import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../api/client.js';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';

export const MyOrdersPage = () => {
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => apiClient.get('/orders/my-orders')
  });

  const orderGroups = response?.data?.orders || [];

  if (isLoading) {
    return <LoadingSpinner text="Retrieving your bookings and orders..." fullPage />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
          My Bookings & Orders
        </h1>
        <p className="text-sm text-stone-600">
          Track fulfillment status, rental pickup & returns, and payment records.
        </p>
      </div>

      {orderGroups.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders Yet"
          description="You haven't placed any orders or rental reservations yet."
          actionText="Browse Marketplace"
          actionLink="/catalog"
        />
      ) : (
        <div className="space-y-6">
          {orderGroups.map((group) => (
            <div
              key={group._id}
              className="bg-white rounded-2xl border border-ivory-200 overflow-hidden shadow-sm p-6 space-y-6"
            >
              {/* Order Group Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ivory-200">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-stone-900 text-lg">
                      #{group.orderGroupNumber}
                    </span>
                    <Badge variant={group.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
                      Payment: {group.paymentStatus}
                    </Badge>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Placed on: {new Date(group.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-stone-500">Gross Total</div>
                  <div className="text-lg font-bold text-maroon-900">
                    ₹{group.pricingSnapshot?.grossPayableAmount?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Delivery Address Snapshot */}
              {group.deliveryAddress && (
                <div className="text-xs text-stone-600 bg-ivory-50 p-3 rounded-xl flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <span>
                    Delivering to: <strong>{group.deliveryAddress.fullName}</strong> ({group.deliveryAddress.phone}) —{' '}
                    {group.deliveryAddress.street}, {group.deliveryAddress.city}, {group.deliveryAddress.pincode}
                  </span>
                </div>
              )}

              {/* Vendor Sub-Orders */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                  Vendor Fulfillment Orders ({group.vendorOrders?.length || 0})
                </h4>

                {group.vendorOrders?.map((subOrder) => (
                  <div
                    key={subOrder._id}
                    className="p-4 rounded-xl border border-ivory-200 bg-ivory-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-maroon-900">
                        Vendor: {subOrder.vendorId?.businessName || 'ShaadiSaathi Partner'}
                      </span>
                      <Badge variant="default" size="sm">
                        Status: {subOrder.fulfillmentStatus}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {subOrder.items?.map((item) => (
                        <div key={item._id} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <Badge variant={item.transactionType} size="sm">
                              {item.transactionType}
                            </Badge>
                            <span className="font-medium text-stone-800">{item.title}</span>
                            <span className="text-stone-400">× {item.quantity}</span>
                          </div>
                          <span className="font-bold text-stone-900">
                            ₹{item.lineSubtotal?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
