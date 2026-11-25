import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

export interface PromoCode {
  code: string;
  discountPercentage: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neuroflow_cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [promo, setPromo] = useState<PromoCode | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('neuroflow_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addItem = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setPromo(null);
  }, []);

  const applyPromoCode = useCallback((code: string) => {
    if (code.toUpperCase() === 'NEURO20') {
      setPromo({ code: 'NEURO20', discountPercentage: 20 });
      return true;
    }
    return false;
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = promo ? (subtotal * promo.discountPercentage) / 100 : 0;
  const total = Math.max(0, subtotal - discount);

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyPromoCode,
    promo,
    subtotal,
    discount,
    total,
  };
};
