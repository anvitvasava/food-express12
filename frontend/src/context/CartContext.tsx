import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // dishId
  uniqueKey: string; // combining dishId + customizations for separate items
  name: string;
  price: number;
  quantity: number;
  image: string;
  isVeg: boolean;
  customizations?: { [title: string]: string[] };
}

interface CartContextType {
  cartItems: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  couponCode: string;
  discount: number;
  tip: number;
  addToCart: (restaurantId: string, restaurantName: string, item: any, customizations?: { [title: string]: string[] }, quantity?: number) => void;
  removeFromCart: (uniqueKey: string) => void;
  updateQuantity: (uniqueKey: string, amount: number) => void;
  applyCoupon: (code: string) => boolean;
  setTip: (amount: number) => void;
  clearCart: () => void;
  getPricingSummary: (deliveryFee: number) => {
    subtotal: number;
    deliveryFee: number;
    packingFee: number;
    tax: number;
    tip: number;
    discount: number;
    total: number;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [tip, setTip] = useState<number>(0);

  // Load cart from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedRestId = localStorage.getItem('cart_restaurant_id');
    const savedRestName = localStorage.getItem('cart_restaurant_name');
    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedRestId) setRestaurantId(savedRestId);
    if (savedRestName) setRestaurantName(savedRestName);
  }, []);

  // Save cart to local storage
  const saveCartToStorage = (items: CartItem[], restId: string | null, restName: string | null) => {
    setCartItems(items);
    setRestaurantId(restId);
    setRestaurantName(restName);
    localStorage.setItem('cart', JSON.stringify(items));
    if (restId) localStorage.setItem('cart_restaurant_id', restId);
    else localStorage.removeItem('cart_restaurant_id');
    if (restName) localStorage.setItem('cart_restaurant_name', restName);
    else localStorage.removeItem('cart_restaurant_name');
  };

  const getCustomizationKey = (customizations?: { [title: string]: string[] }) => {
    if (!customizations) return '';
    return Object.entries(customizations)
      .map(([title, opts]) => `${title}:${opts.sort().join(',')}`)
      .sort()
      .join('|');
  };

  const addToCart = (
    restId: string,
    restName: string,
    item: any,
    customizations?: { [title: string]: string[] },
    quantity = 1
  ) => {
    // If user orders from a different restaurant, clear current cart first
    let currentItems = [...cartItems];
    if (restaurantId && restaurantId !== restId) {
      if (!window.confirm('Adding items from a new restaurant will clear your current cart. Proceed?')) {
        return;
      }
      currentItems = [];
    }

    // Calculate unique key for item + customization combination
    const custKey = getCustomizationKey(customizations);
    const uniqueKey = `${item.id}_${custKey}`;

    // Calculate total price with customizations
    let basePrice = item.price;
    if (customizations) {
      Object.entries(customizations).forEach(([title, selectedOpts]) => {
        const custMenu = item.customizations?.find((c: any) => c.title === title);
        if (custMenu) {
          selectedOpts.forEach((optName) => {
            const optPrice = custMenu.options.find((o: any) => o.name === optName)?.price || 0;
            basePrice += optPrice;
          });
        }
      });
    }

    const existingIdx = currentItems.findIndex((ci) => ci.uniqueKey === uniqueKey);

    if (existingIdx !== -1) {
      currentItems[existingIdx].quantity += quantity;
    } else {
      currentItems.push({
        id: item.id,
        uniqueKey,
        name: item.name,
        price: basePrice,
        quantity,
        image: item.image,
        isVeg: item.isVeg,
        customizations
      });
    }

    saveCartToStorage(currentItems, restId, restName);
  };

  const removeFromCart = (uniqueKey: string) => {
    const nextItems = cartItems.filter((ci) => ci.uniqueKey !== uniqueKey);
    const nextRestId = nextItems.length ? restaurantId : null;
    const nextRestName = nextItems.length ? restaurantName : null;
    saveCartToStorage(nextItems, nextRestId, nextRestName);
  };

  const updateQuantity = (uniqueKey: string, amount: number) => {
    const nextItems = cartItems
      .map((ci) => {
        if (ci.uniqueKey === uniqueKey) {
          return { ...ci, quantity: Math.max(1, ci.quantity + amount) };
        }
        return ci;
      })
      .filter((ci) => ci.quantity > 0);

    const nextRestId = nextItems.length ? restaurantId : null;
    const nextRestName = nextItems.length ? restaurantName : null;
    saveCartToStorage(nextItems, nextRestId, nextRestName);
  };

  const applyCoupon = (code: string): boolean => {
    const subtotal = cartItems.reduce((acc, ci) => acc + ci.price * ci.quantity, 0);
    if (subtotal === 0) return false;

    const formattedCode = code.toUpperCase().trim();
    if (formattedCode === 'EXPRESS50') {
      setCouponCode(formattedCode);
      setDiscount(Math.min(100, Math.round(subtotal * 0.5))); // 50% up to 100
      return true;
    } else if (formattedCode === 'FREEDEL') {
      setCouponCode(formattedCode);
      // Actual delivery fee deduction calculated dynamically in getPricingSummary
      setDiscount(0); // Handled inside pricing formula
      return true;
    }

    return false;
  };

  const setTipAmount = (amount: number) => {
    setTip(amount);
  };

  const clearCart = () => {
    saveCartToStorage([], null, null);
    setCouponCode('');
    setDiscount(0);
    setTip(0);
  };

  const getPricingSummary = (deliveryFee = 20) => {
    const subtotal = cartItems.reduce((acc, ci) => acc + ci.price * ci.quantity, 0);
    const packingFee = subtotal > 0 ? 10 : 0;
    const tax = subtotal > 0 ? Math.round(subtotal * 0.05) : 0; // 5% GST
    
    let activeDeliveryFee = subtotal > 0 ? deliveryFee : 0;
    let activeDiscount = discount;

    if (couponCode === 'FREEDEL') {
      activeDiscount = activeDeliveryFee;
    }

    const total = Math.max(0, subtotal + activeDeliveryFee + packingFee + tax + tip - activeDiscount);

    return {
      subtotal,
      deliveryFee: activeDeliveryFee,
      packingFee,
      tax,
      tip,
      discount: activeDiscount,
      total
    };
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      restaurantId,
      restaurantName,
      couponCode,
      discount,
      tip,
      addToCart,
      removeFromCart,
      updateQuantity,
      applyCoupon,
      setTip: setTipAmount,
      clearCart,
      getPricingSummary
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
