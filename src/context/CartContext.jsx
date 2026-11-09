"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "vicix-cart-v1";

function normalizeQuantity(value) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.floor(quantity));
}

function normalizeStock(value) {
  if (value === undefined || value === null || value === "") return null;
  const stock = Number(value);
  if (!Number.isFinite(stock)) return 0;
  return Math.max(0, Math.floor(stock));
}

function normalizePrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) return 0;
  return Math.round((price + Number.EPSILON) * 100) / 100;
}

function normalizeCartItem(item) {
  if (!item || typeof item.id !== "string" || !item.id.trim()) return null;
  const stock = normalizeStock(item.stock);
  if (stock === 0) return null;
  const requestedQuantity = normalizeQuantity(item.quantity);
  return {
    id: item.id,
    name: typeof item.name === "string" ? item.name : "",
    image: typeof item.image === "string" ? item.image : null,
    price: normalizePrice(item.price),
    category: typeof item.category === "string" ? item.category : "",
    quantity: stock === null ? requestedQuantity : Math.min(requestedQuantity, stock),
    stock,
  };
}

function loadStoredCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    const uniqueItems = [];
    for (const item of parsed.map(normalizeCartItem).filter(Boolean)) {
      const existing = uniqueItems.find((current) => current.id === item.id);
      if (!existing) {
        uniqueItems.push({ ...item });
        continue;
      }
      const stock = item.stock !== null ? item.stock : existing.stock;
      const totalQuantity = existing.quantity + item.quantity;
      existing.quantity = stock === null ? totalQuantity : Math.min(totalQuantity, stock);
      existing.stock = stock;
    }
    return uniqueItems;
  } catch (error) {
    console.error("Sepet yüklenemedi:", error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  // Ref, arka arkaya tıklamalarda henüz render edilmemiş en güncel sepeti tutar.
  const itemsRef = useRef([]);

  useEffect(() => {
    const storedItems = loadStoredCart();
    itemsRef.current = storedItems;
    setItems(storedItems);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Sepet kaydedilemedi:", error);
    }
  }, [items, hydrated]);

  const commitItems = useCallback((nextItems) => {
    itemsRef.current = nextItems;
    setItems(nextItems);
  }, []);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product || typeof product.id !== "string" || !product.id.trim()) return false;
    // Yükleme tamamlanmadan yapılan işlemin depolanan sepeti ezmesini engelle.
    if (!hydrated) return false;

    const stock = normalizeStock(product.stock);
    if (stock === 0) return false;

    const amount = normalizeQuantity(quantity);
    const previous = itemsRef.current;
    const existing = previous.find((item) => item.id === product.id);

    if (existing) {
      const currentStock = stock !== null ? stock : existing.stock ?? null;
      if (currentStock === 0) return false;

      const nextQuantity = currentStock === null
        ? existing.quantity + amount
        : Math.min(existing.quantity + amount, currentStock);

      // Stok doluysa ürün eklenmedi: başarı bildirimi gösterilmemeli.
      if (nextQuantity <= existing.quantity) return false;

      commitItems(previous.map((item) =>
        item.id === product.id
          ? { ...item, quantity: nextQuantity, stock: currentStock }
          : item
      ));
      return true;
    }

    const nextQuantity = stock === null ? amount : Math.min(amount, stock);
    if (nextQuantity <= 0) return false;

    commitItems([
      ...previous,
      {
        id: product.id,
        name: typeof product.name === "string" ? product.name : "",
        image: typeof product.image === "string" ? product.image : null,
        price: normalizePrice(product.price),
        category: typeof (product.categoryName || product.category) === "string"
          ? product.categoryName || product.category
          : "",
        quantity: nextQuantity,
        stock,
      },
    ]);
    return true;
  }, [commitItems, hydrated]);

  const removeFromCart = useCallback((productId) => {
    commitItems(itemsRef.current.filter((item) => item.id !== productId));
  }, [commitItems]);

  const updateQuantity = useCallback((productId, quantity) => {
    const amount = Number(quantity);
    if (!Number.isFinite(amount)) return;
    const previous = itemsRef.current;
    if (amount <= 0) {
      commitItems(previous.filter((item) => item.id !== productId));
      return;
    }
    const requestedQuantity = normalizeQuantity(amount);
    const next = previous.map((item) => {
      if (item.id !== productId) return item;
      const stock = normalizeStock(item.stock);
      if (stock === 0) return item;
      const nextQuantity = stock === null
        ? requestedQuantity
        : Math.min(requestedQuantity, stock);
      return nextQuantity === item.quantity ? item : { ...item, quantity: nextQuantity };
    });
    if (next.some((item, index) => item !== previous[index])) commitItems(next);
  }, [commitItems]);

  const clearCart = useCallback(() => {
    commitItems([]);
  }, [commitItems]);

  const cartCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const cartTotal = useMemo(() => {
    const totalCents = items.reduce(
      (total, item) => total + Math.round(item.price * 100) * item.quantity,
      0
    );
    return totalCents / 100;
  }, [items]);

  const value = useMemo(() => ({
    items,
    hydrated,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }), [items, hydrated, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart, CartProvider içerisinde kullanılmalıdır.");
  return context;
}
