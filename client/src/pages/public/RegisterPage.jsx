import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { AlertCircle, Lock, Mail, User, Phone, Store } from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'vendor' ? 'vendor' : 'customer';

  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const payload = {
        name,
        email,
        phone,
        password,
        role,
        ...(role === 'vendor' ? { businessName } : {})
      };

      await register(payload);
      navigate(role === 'vendor' ? '/vendor/dashboard' : '/catalog');
    } catch (err) {
      setErrorMessage(err?.error?.message || err?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-ivory-200 p-8 shadow-wedding">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-maroon-900 text-gold-400 flex items-center justify-center mx-auto mb-3 text-xl shadow-sm">
            💍
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Create an Account</h1>
          <p className="text-xs text-stone-500 mt-1">Join India’s premier wedding marketplace</p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-ivory-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              role === 'customer'
                ? 'bg-white text-maroon-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Planning a Wedding (Customer)
          </button>
          <button
            type="button"
            onClick={() => setRole('vendor')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              role === 'vendor'
                ? 'bg-white text-maroon-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            I'm a Vendor / Professional
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-stone-500 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Pooja Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800"
              />
            </div>
          </div>

          {role === 'vendor' && (
            <div>
              <label className="block text-xs uppercase font-bold text-stone-500 mb-1">
                Business / Brand Name
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Royal Mandap & Catering Services"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-stone-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="pooja@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-stone-500 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-stone-500 mb-1">
              Password (min 8 chars)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full shadow-md mt-2"
          >
            Complete Registration
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-maroon-900 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
