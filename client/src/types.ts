export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  discount: number;
  image: string;
  sales: number;
}

export interface Banner {
  id: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  items: CartItem[];
  total: number;
  location: { lat: number; lng: number };
  address: string;
  status: 'pending' | 'delivering' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveredAt?: string;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  phone: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  from: 'user' | 'admin';
  read: boolean;
  createdAt: string;
}

export type Lang = 'uz' | 'ru' | 'en';
