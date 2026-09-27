import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getLinePrice, getSellTypeMeta, roundQuantity, safeJsonParse } from '../lib/utils';

const CartContext = createContext(null);
const STORAGE_KEY = 'aarot-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = safeJsonParse(stored, []);

    // ✅ Ensure it's always an array
    return Array.isArray(parsed)
      ? parsed.map((item) => ({ ...item, quantity: roundQuantity(item.quantity) }))
      : [];
  });

  // ✅ Persist to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items || []));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, [items]);

  const addItem = (product, quantity) => {
    setItems((currentItems = []) => {
      const safeItems = Array.isArray(currentItems) ? currentItems : [];

      const existing = safeItems.find((item) => item.id === product.id);

      if (existing) {
        return safeItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: roundQuantity(Number(item.quantity) + Number(quantity)),
              }
            : item
        );
      }

      return [
        ...safeItems,
        {
          ...product,
          quantity: roundQuantity(quantity),
        },
      ];
    });
  };

  const removeItem = (productId) => {
    setItems((currentItems = []) =>
      (Array.isArray(currentItems) ? currentItems : []).filter(
        (item) => item.id !== productId
      )
    );
  };

  const updateItemQuantity = (productId, quantity) => {
    setItems((currentItems = []) =>
      (Array.isArray(currentItems) ? currentItems : [])
        .map((item) => {
          if (item.id !== productId) return item;

          const meta = getSellTypeMeta(item.sell_type);

          return {
            ...item,
            quantity: roundQuantity(Math.max(Number(meta?.min || 0), Number(quantity))),
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  // ✅ Safe subtotal calculation
  const subtotal = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];

    return roundQuantity(
      safeItems.reduce((sum, item) => sum + getLinePrice(item), 0),
      2,
    );
  }, [items]);

  // ✅ Safe total items calculation
  const totalItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];

    return safeItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  }, [items]);

  const value = {
    items: Array.isArray(items) ? items : [],
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    subtotal,
    totalItems,
  };

  return CartContext.Provider
  ? (
      <CartContext.Provider value={value}>
        {children}
      </CartContext.Provider>
    )
  : null;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
