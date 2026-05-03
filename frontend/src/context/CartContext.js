import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.items.find(i => i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color);
      if (existing) {
        return { ...state, items: state.items.map(i => (i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color) ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) } : i) };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, items: state.items.filter(i => !(i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color)) };
    case 'UPDATE_QUANTITY':
      return { ...state, items: state.items.map(i => (i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color) ? { ...i, quantity: action.payload.quantity } : i) };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem('garmentx_cart')) || []; }
  catch { return []; }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: loadCart() });

  useEffect(() => {
    localStorage.setItem('garmentx_cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product, size, color, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, size, color, quantity } });
    toast.success(`${product.name} added to cart! 🛍️`, { duration: 2000 });
  };

  const removeFromCart = (id, size, color) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { _id: id, size, color } });
    toast.success('Item removed from cart');
  };

  const updateQuantity = (id, size, color, quantity) => {
    if (quantity < 1) return;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { _id: id, size, color, quantity } });
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const cartCount = state.items.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotal = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems: state.items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
