
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "vicix-cart-v1";

function normalizeQuantity(value) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity)) return 1;

  return Math.max(1, Math.floor(quantity));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (item) =>
                item &&
                typeof item.id === "string" &&
                item.id.length > 0
            )
          );
        }
      }
    } catch (error) {
      console.error("Sepet yüklenemedi:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error("Sepet kaydedilemedi:", error);
    }
  }, [items, hydrated]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?.id) return false;

    if (
      product.stock !== undefined &&
      product.stock !== null &&
      Number(product.stock) <= 0
    ) {
      return false;
    }

    const amount = normalizeQuantity(quantity);

    setItems((previous) => {
      const existing = previous.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item
        );
      }

      return [
        ...previous,
        {
          id: product.id,
          name: product.name,
          image: product.image || null,
          price: Number(product.price) || 0,
          category: product.categoryName || product.category || "",
          quantity: amount,
        },
      ];
    });

    return true;
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((previous) =>
      previous.filter((item) => item.id !== productId)
    );
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const amount = Number(quantity);

    if (!Number.isFinite(amount)) return;

    if (amount <= 0) {
      setItems((previous) =>
        previous.filter((item) => item.id !== productId)
      );
      return;
    }

    setItems((previous) =>
      previous.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: normalizeQuantity(amount),
            }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartCount = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [items]
  );

  const cartTotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      hydrated,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      hydrated,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart, CartProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}
