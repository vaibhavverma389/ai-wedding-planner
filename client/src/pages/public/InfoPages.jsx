import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';

export const AboutPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
    <div className="text-center space-y-3">
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 bg-gold-50 px-3 py-1 rounded-full uppercase">
        Our Vision
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900">
        About ShaadiSaathi (शादी साथी)
      </h1>
      <p className="text-sm text-stone-600 max-w-2xl mx-auto">
        Empowering couples, families, and vendors with a reliable, transparent wedding marketplace built specifically for the vibrant Indian wedding industry.
      </p>
    </div>

    <div className="bg-white rounded-3xl border border-ivory-200 p-8 sm:p-12 shadow-sm space-y-6 text-sm text-stone-700 leading-relaxed">
      <p>
        Planning an Indian wedding is a joyous celebration that often involves dozens of functions: Haldi, Mehendi, Sangeet, Baraat, Mandap Pheras, and Grand Receptions. Historically, booking rentals, decor, and artists across multiple cities was fragmented and lacked transparent pricing.
      </p>
      <p>
        <strong>ShaadiSaathi</strong> bridges this gap by unifying four distinct transaction models:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-stone-800">
        <li><strong>Equipment & Decor Rentals:</strong> Verified mandap frames, luxury bridal cars, sound setups, and seating with escrow deposits.</li>
        <li><strong>Brand New Essentials:</strong> Shipped directly from verified artisans and gift makers.</li>
        <li><strong>Pre-Loved Deals:</strong> Sustainable bridal fashion and ceremonial props with verified condition ratings.</li>
        <li><strong>Professional Services:</strong> Caterers, cinematographers, pandits, and wedding planners with milestone quotations.</li>
      </ul>
    </div>
  </div>
);

export const FAQPage = () => {
  const faqs = [
    {
      q: 'How does the rental security deposit work?',
      a: 'When you rent equipment or outfits, a refundable security deposit is calculated. It is held securely in escrow and returned to your original payment method once the vendor inspects the returned item.'
    },
    {
      q: 'How are vendors verified?',
      a: 'All ShaadiSaathi vendors undergo portfolio audits, identity checks, and GST verification before their listings are published.'
    },
    {
      q: 'Can I book multiple vendors in a single checkout?',
      a: 'Yes! ShaadiSaathi supports multi-vendor carts. Your payment is processed in one transaction, and the platform automatically splits fulfillment into sub-orders for each respective vendor.'
    },
    {
      q: 'What is the cancellation and refund policy?',
      a: 'Orders can be cancelled before dispatch or service commencement. Applicable refunds are automatically processed back to your original payment method via Razorpay.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="font-serif text-4xl font-bold text-stone-900">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-stone-600">Everything you need to know about ShaadiSaathi</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gold-600 flex-shrink-0" />
              <span>{faq.q}</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed pl-7">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PolicyPage = ({ title, content }) => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
    <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">{title}</h1>
    <div className="bg-white rounded-3xl border border-ivory-200 p-8 sm:p-12 shadow-sm space-y-4 text-xs text-stone-700 leading-relaxed whitespace-pre-line">
      {content}
    </div>
  </div>
);
