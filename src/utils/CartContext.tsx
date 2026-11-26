import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Product, ProductVariant } from '../types';
import { getProductDetailData } from '../data/productVariants';
import { productDisplayName } from './catalog';
import { trackCommerceEvent } from './analyticsService';
import type { ManagedCoupon } from '../data/coupons';
import { DEFAULT_COUPONS } from '../data/coupons';
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
  cartNotice: string;
  clearCartNotice: () => void;
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

export function reconcileCartItems(savedItems: CartItem[], products: Product[]) {
  const byId = new Map(products.map((product) => [product.id, product]));
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const reconciled = new Map<string, CartItem>();
  let changedCount = 0;
  let removedCount = 0;

  for (const savedItem of savedItems) {
    const product = byId.get(savedItem.productId) || bySlug.get(savedItem.slug);
    if (!product || product.status !== 'active') {
      removedCount += 1;
      continue;
    }

    const variants = getProductDetailData(product).variants;
    const selectedVariant = variants.find((variant) => variant.id === savedItem.variantId)
      || variants.find((variant) => variant.sku === savedItem.sku)
      || variants.find((variant) => variant.label.toLocaleLowerCase('vi') === savedItem.variantLabel.toLocaleLowerCase('vi'))
      || variants[0];
    if (!selectedVariant) {
      removedCount += 1;
      continue;
    }

    const freshItem = makeCartItem(product, selectedVariant, savedItem.quantity);
    freshItem.name = productDisplayName(product);
    const wasChanged = freshItem.key !== savedItem.key
      || freshItem.price !== savedItem.price
      || freshItem.variantLabel !== savedItem.variantLabel
      || freshItem.name !== savedItem.name
      || freshItem.imageUrl !== savedItem.imageUrl;
    if (wasChanged) changedCount += 1;

    const duplicate = reconciled.get(freshItem.key);
    reconciled.set(freshItem.key, duplicate
      ? { ...freshItem, quantity: duplicate.quantity + freshItem.quantity }
      : freshItem);
  }

  return { items: [...reconciled.values()], changedCount, removedCount };
}

export const CartProvider: React.FC<{
  children: React.ReactNode;
  products?: Product[];
  catalogReady?: boolean;
}> = ({ children, products = [], catalogReady = false }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadSavedCart());
  const [couponCode, setCouponCode] = useState<string>(() => loadSavedCoupon());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState('');
  const [managedCoupons, setManagedCoupons] = useState<ManagedCoupon[]>(DEFAULT_COUPONS);

  useEffect(() => {
    fetch('/api/coupons/active', { cache: 'no-store' }).then((res) => res.ok ? res.json() : null).then((data) => {
      if (Array.isArray(data?.coupons)) setManagedCoupons(data.coupons);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!catalogReady || products.length === 0 || items.length === 0) return;
    const result = reconcileCartItems(items, products);
    if (result.changedCount === 0 && result.removedCount === 0) return;
    const messages = [];
    if (result.changedCount > 0) messages.push(`${result.changedCount} sản phẩm đã được cập nhật theo giá và phân loại hiện tại`);
    if (result.removedCount > 0) messages.push(`${result.removedCount} sản phẩm ngừng bán đã được gỡ khỏi giỏ`);
    setItems(result.items);
    setCartNotice(`${messages.join('. ')}. Vui lòng kiểm tra lại trước khi thanh toán.`);
    // Cart changes are intentionally excluded: reconciliation runs when the authoritative catalogue changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogReady, products]);

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  useEffect(() => {
    saveCouponToStorage(couponCode);
  }, [couponCode]);

  const totals = useMemo(() => calculateCheckoutTotals(items, couponCode, managedCoupons), [items, couponCode, managedCoupons]);
  const couponResult = useMemo(() => evaluateCoupon(couponCode, totals.subtotal, managedCoupons), [couponCode, totals.subtotal, managedCoupons]);
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const clearCartNotice = useCallback(() => setCartNotice(''), []);

  const addToCart = useCallback(
    (product: Product, variant?: ProductVariant, quantity = 1, openMiniCart = true) => {
      const detail = getProductDetailData(product);
      const selectedVariant = variant || detail.variants[0];
      if (!selectedVariant) return;

      const newItem = makeCartItem(product, selectedVariant, quantity);
      newItem.name = productDisplayName(product);
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
      trackCommerceEvent('add_to_cart', {
        value: newItem.price * newItem.quantity,
        items: [{
          item_id: product.id,
          item_name: newItem.name,
          item_category: product.category,
          item_variant: selectedVariant.label,
          price: selectedVariant.price,
          quantity: newItem.quantity,
        }],
      });
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
      return evaluateCoupon(normalized, totals.subtotal, managedCoupons);
    },
    [totals.subtotal, managedCoupons]
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
      cartNotice,
      clearCartNotice,
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
      cartNotice,
      clearCartNotice,
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
      cartNotice: '',
      clearCartNotice: () => {},
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
