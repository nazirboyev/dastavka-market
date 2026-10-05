import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, Banner, CartItem, User, Order, Lang } from '../types';
import { apiGet } from '../api';

interface AppContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  products: Product[];
  banners: Banner[];
  orders: Order[];
  refreshProducts: () => void;
  refreshBanners: () => void;
  refreshOrders: () => void;
  cartTotal: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'uz');
  const [user, setUserState] = useState<User | null>(() => {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  });
  const [isAdmin, setIsAdminState] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const s = localStorage.getItem('cart');
    return s ? JSON.parse(s) : [];
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem('lang', l); };
  const setUser = (u: User | null) => { setUserState(u); u ? localStorage.setItem('user', JSON.stringify(u)) : localStorage.removeItem('user'); };
  const setIsAdmin = (v: boolean) => { setIsAdminState(v); localStorage.setItem('isAdmin', String(v)); };

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

  const refreshProducts = useCallback(() => {
    apiGet<Product[]>('/api/products').then(setProducts).catch(console.error);
  }, []);

  const refreshBanners = useCallback(() => {
    apiGet<Banner[]>('/api/banners').then(setBanners).catch(console.error);
  }, []);

  const refreshOrders = useCallback(() => {
    const url = isAdmin ? '/api/orders' : user ? `/api/orders?userId=${user.id}` : '/api/orders?userId=none';
    apiGet<Order[]>(url).then(setOrders).catch(console.error);
  }, [isAdmin, user]);

  useEffect(() => {
    refreshProducts();
    refreshBanners();
    refreshOrders();

    const ws = new WebSocket(`ws://${window.location.hostname}:3001`);
    ws.onmessage = (e) => {
      const { type, payload } = JSON.parse(e.data);
      if (type === 'products') setProducts(payload);
      if (type === 'banners') setBanners(payload);
      if (type === 'orders') setOrders(payload);
    };
    return () => ws.close();
  }, [refreshProducts, refreshBanners, refreshOrders]);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };
  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((s, i) => {
    const price = i.discount > 0 ? i.price * (1 - i.discount / 100) : i.price;
    return s + price * i.quantity;
  }, 0);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <AppContext.Provider value={{
      lang, setLang, user, setUser, isAdmin, setIsAdmin,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      products, banners, orders,
      refreshProducts, refreshBanners, refreshOrders,
      cartTotal, cartCount
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
