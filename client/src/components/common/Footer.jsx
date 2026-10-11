import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, RefreshCw, Headphones, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 border-t-4 border-gold-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-stone-800 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-gold-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">100% Verified Vendors</h4>
              <p className="text-xs text-stone-400">Strict background & portfolio audits</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-gold-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Transparent Pricing</h4>
              <p className="text-xs text-stone-400">Zero hidden commissions or surprises</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-gold-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Escrow Protection</h4>
              <p className="text-xs text-stone-400">Deposit holds released post-event</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-gold-400">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Wedding Concierge</h4>
              <p className="text-xs text-stone-400">Dedicated assistance across India</p>
            </div>
          </div>
        </div>

        {/* Sitemap & Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-stone-800">
          {/* Brand Intro */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl">💍</span>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Shaadi<span className="text-gold-400">Saathi</span>
              </span>
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm mb-4">
              ShaadiSaathi is India’s hybrid wedding marketplace connecting couples and families with verified vendors for rentals, purchases, and professional ceremony services.
            </p>
            <div className="text-xs text-gold-400 font-medium">
              Made with <Heart className="w-3.5 h-3.5 inline text-rose-500 fill-rose-500" /> for celebrations across Bharat.
            </div>
          </div>

          {/* Transaction Types */}
          <div>
            <h5 className="font-serif font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Explore
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/catalog?type=RENT" className="hover:text-gold-400 transition-colors">
                  Rentals & Decor
                </Link>
              </li>
              <li>
                <Link to="/catalog?type=BUY_NEW" className="hover:text-gold-400 transition-colors">
                  Buy Wedding Essentials
                </Link>
              </li>
              <li>
                <Link to="/catalog?type=BUY_USED" className="hover:text-gold-400 transition-colors">
                  Pre-Loved Outfits & Props
                </Link>
              </li>
              <li>
                <Link to="/catalog?type=BOOK_SERVICE" className="hover:text-gold-400 transition-colors">
                  Book Services & Pandits
                </Link>
              </li>
              <li>
                <Link to="/vendors" className="hover:text-gold-400 transition-colors">
                  Vendor Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h5 className="font-serif font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Categories
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/catalog?category=wedding-decorations" className="hover:text-gold-400 transition-colors">
                  Mandap & Stage Decor
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=catering-and-food" className="hover:text-gold-400 transition-colors">
                  Royal Catering
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=baraat-and-transportation" className="hover:text-gold-400 transition-colors">
                  Vintage Cars & Baraat
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=photography-and-videography" className="hover:text-gold-400 transition-colors">
                  Cinematography & Shoots
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=mehendi-ceremony" className="hover:text-gold-400 transition-colors">
                  Mehendi & Haldi Artists
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policy */}
          <div>
            <h5 className="font-serif font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Policies & Help
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-gold-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-gold-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-gold-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cancellation-refund" className="hover:text-gold-400 transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} ShaadiSaathi Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Primary Market: India (INR ₹)</span>
            <span>•</span>
            <Link to="/register?role=vendor" className="text-gold-400 hover:underline">
              Partner With Us (Register as Vendor)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
