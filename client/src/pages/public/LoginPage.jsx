import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { AlertCircle, Lock, Mail, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await login({ email, password });
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err?.error?.message || err?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-ivory-200 p-8 shadow-wedding">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-maroon-900 text-gold-400 flex items-center justify-center mx-auto mb-3 text-xl shadow-sm">
            💍
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Welcome Back</h1>
          <p className="text-xs text-stone-500 mt-1">Sign in to your ShaadiSaathi account</p>
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
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-maroon-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-stone-500 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
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
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-maroon-900 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
