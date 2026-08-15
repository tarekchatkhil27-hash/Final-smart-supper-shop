"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

export const Header: React.FC = () => {
  const { language, setLanguage, t, cartCount } = useApp();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-2.5 glassmorphism shadow-soft">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0 select-none">
            <img
              src="/sss_logo.png"
              alt="SSS Shopping Cart Logo"
              className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] object-contain shrink-0"
            />
            <span className="font-headline-sm text-[16px] md:text-[20px] font-bold text-[#003366] tracking-tight whitespace-nowrap font-tiro">
              Smart supper Shop
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link
            href="/"
            className={`logo-nav-link ${
              isActive("/")
                ? "logo-nav-link-active font-bold border-b-2 pb-1"
                : "text-on-surface-variant"
            } font-label-md text-label-md`}
          >
            {t("হোম", "Home")}
          </Link>
          <Link
            href="/shop"
            className={`logo-nav-link ${
              isActive("/shop")
                ? "logo-nav-link-active font-bold border-b-2 pb-1"
                : "text-on-surface-variant"
            } font-label-md text-label-md`}
          >
            {t("শপ", "Shop")}
          </Link>
          <Link
            href="/about"
            className="logo-nav-link text-on-surface-variant font-label-md text-label-md"
          >
            {t("আমাদের সম্পর্কে", "About Us")}
          </Link>
          <Link
            href="/contact"
            className="logo-nav-link text-on-surface-variant font-label-md text-label-md"
          >
            {t("যোগাযোগ", "Contact")}
          </Link>

        </nav>

        <div className="flex items-center gap-4 text-primary">
          {/* Language Selector */}
          <button
            onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
            className="text-xs font-bold border border-primary/30 rounded-lg px-2.5 py-1 text-primary hover:bg-primary/10 transition-colors btn-press cursor-pointer hover-lift"
          >
            {language === "bn" ? "EN" : "বাংলা"}
          </button>

          {/* Search Toggle */}
          <div className="relative flex items-center">
            {showSearch && (
              <input
                type="text"
                placeholder={t("পণ্য খুঁজুন...", "Search products...")}
                className="absolute right-10 bg-surface border border-outline-variant rounded-full px-4 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary w-48 transition-all"
              />
            )}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="scale-95 active:scale-90 transition-transform hover:text-primary-dark transition-colors duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined align-middle">search</span>
            </button>
          </div>

          {/* Cart Button */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors text-primary btn-press cursor-pointer shadow-soft hover-lift"
          >
            <span className="material-symbols-outlined align-middle">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center animate-pulse">
                {language === "bn"
                  ? cartCount.toLocaleString("bn-BD")
                  : cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Navigation (Dark background, white text, Home/Shop/Cart/Contact from right) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex flex-row-reverse justify-around items-center py-1.5 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)]">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] gap-0.5 text-[10px] font-bold transition-all duration-200 ${
            isActive("/") ? "text-[#ff6600] scale-105" : "text-white hover:text-gray-300"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span>{t("হোম", "Home")}</span>
        </Link>

        <Link
          href="/shop"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] gap-0.5 text-[10px] font-bold transition-all duration-200 ${
            isActive("/shop") ? "text-[#ff6600] scale-105" : "text-white hover:text-gray-300"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">storefront</span>
          <span>{t("শপ", "Shop")}</span>
        </Link>

        <Link
          href="/cart"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] gap-0.5 text-[10px] font-bold transition-all duration-200 ${
            isActive("/cart") ? "text-[#ff6600] scale-105" : "text-white hover:text-gray-300"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-[25%] bg-gradient-orange text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {language === "bn" ? cartCount.toLocaleString("bn-BD") : cartCount}
            </span>
          )}
          <span>{t("কার্ট", "Cart")}</span>
        </Link>

        <Link
          href="/contact"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] gap-0.5 text-[10px] font-bold transition-all duration-200 ${
            isActive("/contact") ? "text-[#ff6600] scale-105" : "text-white hover:text-gray-300"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">chat</span>
          <span>{t("যোগাযোগ", "Contact")}</span>
        </Link>
      </nav>
    </>
  );
};
