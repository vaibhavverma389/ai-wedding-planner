import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout.jsx';
import { HomePage } from '../pages/public/HomePage.jsx';
import { CatalogPage } from '../pages/public/CatalogPage.jsx';
import { ListingDetailPage } from '../pages/public/ListingDetailPage.jsx';
import { VendorDirectoryPage } from '../pages/public/VendorDirectoryPage.jsx';
import { CartPage } from '../pages/public/CartPage.jsx';
import { LoginPage } from '../pages/public/LoginPage.jsx';
import { RegisterPage } from '../pages/public/RegisterPage.jsx';
import { MyOrdersPage } from '../pages/customer/MyOrdersPage.jsx';
import { WeddingPlannerPage } from '../pages/customer/WeddingPlannerPage.jsx';
import { VendorDashboardPage } from '../pages/vendor/VendorDashboardPage.jsx';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage.jsx';
import { AboutPage, FAQPage, PolicyPage } from '../pages/public/InfoPages.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {/* Public Discovery Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/listings/:slug" element={<ListingDetailPage />} />
        <Route path="/vendors" element={<VendorDirectoryPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer Portal Routes */}
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/wedding-planner" element={<WeddingPlannerPage />} />

        {/* Vendor & Admin Dashboard Portals */}
        <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        {/* Informational & Compliance Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route
          path="/terms"
          element={
            <PolicyPage
              title="Terms and Conditions"
              content={`1. Introduction: ShaadiSaathi facilitates wedding rentals, goods purchases, and professional vendor services across India.
              2. Transaction Models: Customers agree to specific terms for Rentals, Retail, Used products, and Services.
              3. Security Deposits: Rental deposits are held in escrow and released post-inspection.`}
            />
          }
        />
        <Route
          path="/privacy"
          element={
            <PolicyPage
              title="Privacy Policy"
              content={`We respect your personal privacy. Customer contact details are shared exclusively with confirmed booking vendors for fulfillment purposes.`}
            />
          }
        />
        <Route
          path="/cancellation-refund"
          element={
            <PolicyPage
              title="Cancellation & Refund Policy"
              content={`Cancellations requested prior to vendor dispatch are eligible for full or partial refunds according to the vendor's policy. All refunds are processed back through Razorpay within 5-7 business days.`}
            />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
