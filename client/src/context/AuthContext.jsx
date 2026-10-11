import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('ss_access_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
          }
        } catch (err) {
          localStorage.removeItem('ss_access_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { user: loggedInUser, accessToken } = res.data;
    if (accessToken) {
      localStorage.setItem('ss_access_token', accessToken);
    }
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const { user: registeredUser, accessToken } = res.data;
    if (accessToken) {
      localStorage.setItem('ss_access_token', accessToken);
    }
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('ss_access_token');
      setUser(null);
    }
  };

  const isCustomer = user?.role === 'customer';
  const isVendor = user?.role === 'vendor';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isCustomer,
        isVendor,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
