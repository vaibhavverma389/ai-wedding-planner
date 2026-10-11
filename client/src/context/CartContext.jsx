import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cartApi.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      if (res?.data) {
        setCart(res.data);
      }
    } catch (err) {
      // Cart might be empty or uninitialized
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (itemData) => {
    const res = await cartApi.addToCart(itemData);
    await fetchCart();
    return res;
  };

  const removeItem = async (itemId) => {
    const res = await cartApi.removeItem(itemId);
    await fetchCart();
    return res;
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await cartApi.updateItemQuantity(itemId, quantity);
    await fetchCart();
    return res;
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        fetchCart,
        addToCart,
        removeItem,
        updateQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
