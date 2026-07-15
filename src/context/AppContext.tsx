"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface PackSize {
  nameBn: string;
  nameEn: string;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
}

export interface CartItem {
  id: string; // Unique ID (e.g., productId or productId-sizeEn)
  productId: string;
  nameBn: string;
  nameEn: string;
  price: number;
  discountPrice?: number;
  image: string;
  unitBn: string;
  unitEn: string;
  quantity: number;
  selectedSize?: PackSize;
}

export interface Product {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  image: string;
  unitBn: string;
  unitEn: string;
  category: string;
  descriptionBn?: string;
  descriptionEn?: string;
  isNew?: boolean;
  packSizes?: PackSize[];
}

interface AppContextType {
  language: "bn" | "en";
  setLanguage: (lang: "bn" | "en") => void;
  t: (bn: string, en: string) => string;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: PackSize) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<"bn" | "en">("bn");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load language and cart from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("sss_lang");
    if (savedLang === "bn" || savedLang === "en") {
      setLanguageState(savedLang);
    }
    const savedCart = localStorage.getItem("sss_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart data", e);
      }
    }
  }, []);

  const setLanguage = (lang: "bn" | "en") => {
    setLanguageState(lang);
    localStorage.setItem("sss_lang", lang);
  };

  const t = (bn: string, en: string) => (language === "bn" ? bn : en);

  const addToCart = (product: Product, quantity: number = 1, selectedSize?: PackSize) => {
    setCart((prevCart) => {
      // Determine unique cart item ID
      const cartItemId = selectedSize ? `${product.id}-${selectedSize.nameEn}` : product.id;
      const existingItem = prevCart.find((item) => item.id === cartItemId);
      
      // Determine active price and unit details
      const activePrice = selectedSize ? selectedSize.price : product.price;
      const activeDiscountPrice = selectedSize ? selectedSize.discountPrice : product.discountPrice;
      const activeUnitBn = selectedSize ? selectedSize.nameBn : product.unitBn;
      const activeUnitEn = selectedSize ? selectedSize.nameEn : product.unitEn;

      let newCart;
      if (existingItem) {
        newCart = prevCart.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newCart = [
          ...prevCart,
          {
            id: cartItemId,
            productId: product.id,
            nameBn: product.nameBn,
            nameEn: product.nameEn,
            price: activePrice,
            discountPrice: activeDiscountPrice,
            image: product.image,
            unitBn: activeUnitBn,
            unitEn: activeUnitEn,
            quantity,
            selectedSize,
          },
        ];
      }
      localStorage.setItem("sss_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== id);
      localStorage.setItem("sss_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) => {
      let newCart;
      if (quantity <= 0) {
        newCart = prevCart.filter((item) => item.id !== id);
      } else {
        newCart = prevCart.map((item) => (item.id === id ? { ...item, quantity } : item));
      }
      localStorage.setItem("sss_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("sss_cart");
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const cartTotal = cart.reduce((total, item) => {
    const activePrice = item.discountPrice !== undefined ? item.discountPrice : item.price;
    return total + activePrice * item.quantity;
  }, 0);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
