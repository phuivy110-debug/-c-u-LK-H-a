import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Product, ProductVariant } from '../types';
import { getProductDetailData } from '../data/productVariants';
import {
  calculateCheckoutTotals,
  evaluateCoupon,
  loadSavedCart,
  loadSavedCoupon,
  makeCartItem,
  saveCartToStorage,
  saveCouponToStorage,
  type CheckoutTotals,
  type CouponValidationResult,
} from './cartStore';

interface CartContextValue {
  items: CartItem[];
  totalQuantity: number;
  couponCode: string;
  couponResult: CouponValidationResult;
  totals: CheckoutTotals;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number, openMiniCart?: boolean) => void;
  updateQuantity: (key: string, delta: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  changeItemVariant: (key: string, product: Product, newVariant: ProductVariant) => void;
  applyCoupon: (code: string) => CouponValidationResult;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadSavedCart());
  const [couponCode, setCouponCode] = useState<string>(() => loadSavedCoupon());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  useEffect(() => {
    saveCouponToStorage(couponCode);
  }, [couponCode]);

  const totals = useMemo(() => calculateCheckoutTotals(items, couponCode), [items, couponCode]);
  const couponResult = useMemo(() => evaluateCoupon(couponCode, totals.subtotal), [couponCode, totals.subtotal]);
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const addToCart = useCallback(
    (product: Product, variant?: ProductVariant, quantity = 1, openMiniCart = true) => {
      const detail = getProductDetailData(product);
      const selectedVariant = variant || detail.variants[0];
      if (!selectedVariant) return;

      const newItem = makeCartItem(product, selectedVariant, quantity);
      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.key === newItem.key);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + newItem.quantity,
          };
          return updated;
        }
        return [...prev, newItem];
      });
      if (openMiniCart) {
        setIsDrawerOpen(true);
      }
    },
    []
  );

  const updateQuantity = useCallback((key: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.key !== key));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity } : item))
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const changeItemVariant = useCallback((key: string, product: Product, newVariant: ProductVariant) => {
    setItems((prev) => {
      const current = prev.find((item) => item.key === key);
      if (!current) return prev;
      const newKey = `${product.id}::${newVariant.id}`;
      if (newKey === key) return prev;
      const duplicate = prev.find((item) => item.key === newKey);
      if (duplicate) {
        return prev
          .filter((item) => item.key !== key)
          .map((item) =>
            item.key === newKey
              ? { ...item, quantity: item.quantity + current.quantity }
              : item
          );
      }
      return prev.map((item) =>
        item.key === key
          ? {
              ...item,
              key: newKey,
              variantId: newVariant.id,
              variantLabel: newVariant.label,
              sku: newVariant.sku,
              price: newVariant.price,
              originalPrice: newVariant.originalPrice,
            }
          : item
      );
    });
  }, []);

  const applyCoupon = useCallback(
    (rawCode: string) => {
      const normalized = rawCode.trim().toUpperCase();
      setCouponCode(normalized);
      return evaluateCoupon(normalized, totals.subtotal);
    },
    [totals.subtotal]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode('');
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalQuantity,
      couponCode,
      couponResult,
      totals,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addToCart,
      updateQuantity,
      setQuantity,
      removeItem,
      changeItemVariant,
      applyCoupon,
      clearCart,
    }),
    [
      items,
      totalQuantity,
      couponCode,
      couponResult,
      totals,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addToCart,
      updateQuantity,
      setQuantity,
      removeItem,
      changeItemVariant,
      applyCoupon,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    // SSR / isolated component test safe fallback
    const emptyTotals = calculateCheckoutTotals([], '');
    return {
      items: [],
      totalQuantity: 0,
      couponCode: '',
      couponResult: evaluateCoupon('', 0),
      totals: emptyTotals,
      isDrawerOpen: false,
      openDrawer: () => {},
      closeDrawer: () => {},
      addToCart: () => {},
      updateQuantity: () => {},
      setQuantity: () => {},
      removeItem: () => {},
      changeItemVariant: () => {},
      applyCoupon: () => evaluateCoupon('', 0),
      clearCart: () => {},
    };
  }
  return ctx;
}
