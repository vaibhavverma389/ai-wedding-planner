import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  Heart,
  ChevronDown,
  LogOut,
  Calendar,
  Package,
  Store,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { Button } from './Button.jsx';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isVendor, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ivory-200 shadow-sm">
      {/* Top Notice Bar */}
      <div className="bg-maroon-900 text-ivory-100 text-xs py-1.5 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-gold-400" />
        <span>India's Most Trusted Wedding Marketplace • Verified Vendors & Escrow Protection</span>
        <Sparkles className="w-3.5 h-3.5 text-gold-400" />
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-full bg-maroon-900 flex items-center justify-center text-gold-400 shadow-sm group-hover:scale-105 transition-transform">
            <span className="font-serif font-bold text-xl">💍</span>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold tracking-tight text-maroon-900 group-hover:text-maroon-800 transition-colors">
              Shaadi<span className="text-gold-600">Saathi</span>
            </div>
            <div className="text-[10px] tracking-widest text-stone-500 uppercase -mt-1 font-medium">
              शादी साथी • Bharat
            </div>
          </div>
        </Link>

        {/* Global Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md relative items-center"
        >
          <input
            type="text"
            placeholder="Search mandap decor, baraat cars, photographers, outfits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ivory-100 border border-ivory-300 rounded-full pl-4 pr-10 py-2.5 text-sm text-stone-800 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-maroon-800 focus:bg-white transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 p-1.5 rounded-full bg-maroon-900 text-white hover:bg-maroon-800 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-700">
          <Link to="/catalog" className="hover:text-maroon-800 transition-colors">
            All Listings
          </Link>
          <Link to="/catalog?type=RENT" className="hover:text-maroon-800 transition-colors">
            Rentals
          </Link>
          <Link to="/catalog?type=BUY_NEW" className="hover:text-maroon-800 transition-colors">
            Buy Essentials
          </Link>
          <Link to="/vendors" className="hover:text-maroon-800 transition-colors">
            Verified Vendors
          </Link>
        </nav>

        {/* Action Controls (Cart & Auth) */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-full bg-ivory-100 text-stone-700 hover:text-maroon-900 hover:bg-ivory-200 transition-colors"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-maroon-900 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Auth Controls */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-ivory-300 hover:border-maroon-800 bg-white transition-all text-sm font-medium text-stone-800"
              >
                <div className="w-7 h-7 rounded-full bg-maroon-100 text-maroon-900 flex items-center justify-center font-bold text-xs uppercase">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-wedding-lg border border-ivory-200 py-2 z-50"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-ivory-100">
                    <p className="text-xs text-stone-500">Signed in as</p>
                    <p className="text-sm font-semibold text-stone-900 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gold-100 text-gold-800">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/my-orders"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-ivory-100 hover:text-maroon-900"
                  >
                    <Package className="w-4 h-4 text-stone-400" />
                    <span>My Bookings & Orders</span>
                  </Link>

                  <Link
                    to="/wedding-planner"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-ivory-100 hover:text-maroon-900"
                  >
                    <Calendar className="w-4 h-4 text-stone-400" />
                    <span>Wedding Planner</span>
                  </Link>

                  {isVendor && (
                    <Link
                      to="/vendor/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-maroon-900 font-semibold hover:bg-maroon-50"
                    >
                      <Store className="w-4 h-4 text-maroon-700" />
                      <span>Vendor Dashboard</span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-900 font-semibold hover:bg-purple-50"
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-700" />
                      <span>Admin Portal</span>
                    </Link>
                  )}

                  <div className="border-t border-ivory-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-stone-600 hover:text-stone-900 lg:hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-ivory-200 px-4 pt-2 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search wedding marketplace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ivory-100 border border-ivory-300 rounded-lg pl-4 pr-10 py-2 text-sm text-stone-800"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 text-stone-500 hover:text-maroon-900"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-col space-y-2 text-sm font-medium text-stone-800">
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-ivory-100 rounded-lg"
            >
              Explore All Listings
            </Link>
            <Link
              to="/catalog?type=RENT"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-ivory-100 rounded-lg"
            >
              Rent Equipment & Decor
            </Link>
            <Link
              to="/catalog?type=BUY_NEW"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-ivory-100 rounded-lg"
            >
              Buy Essentials
            </Link>
            <Link
              to="/vendors"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-ivory-100 rounded-lg"
            >
              Verified Vendors
            </Link>
            <Link
              to="/wedding-planner"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-ivory-100 rounded-lg"
            >
              Wedding Planner
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
