"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useApp, PackSize } from "@/context/AppContext";
import { mockProducts } from "@/data/mockData";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { t, addToCart, language } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<PackSize | undefined>(undefined);

  const product = mockProducts.find((p) => p.slug === slug);

  // Set default pack size on mount if product has packSizes
  useEffect(() => {
    if (product && product.packSizes && product.packSizes.length > 0) {
      // Default to index 1 (middle size) if available, otherwise index 0
      const defaultIndex = product.packSizes.length >= 2 ? 1 : 0;
      setSelectedSize(product.packSizes[defaultIndex]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col justify-between">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-8">
          <h1 className="text-2xl font-bold text-red-500">{t("পণ্যটি পাওয়া যায়নি", "Product Not Found")}</h1>
          <Link href="/shop" className="text-primary mt-4 hover:underline">
            {t("শপে ফিরে যান", "Back to Shop")}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Determine current active price and discount based on selected pack size or default product values
  const activePrice = selectedSize ? selectedSize.price : product.price;
  const activeDiscountPrice = selectedSize ? selectedSize.discountPrice : product.discountPrice;
  const hasDiscount = activeDiscountPrice !== undefined;
  const activeDiscountPercent = selectedSize ? selectedSize.discountPercent : product.discountPercent;

  const displayPrice = hasDiscount ? activeDiscountPrice : activePrice;
  const originalPrice = activePrice;

  const formattedPrice = language === "bn" ? displayPrice?.toLocaleString("bn-BD") : displayPrice;
  const formattedOriginalPrice = language === "bn" ? originalPrice?.toLocaleString("bn-BD") : originalPrice;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize);
    router.push("/checkout");
  };

  const incrementQty = () => setQuantity((q) => q + 1);
  const decrementQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Similar products in same category (excluding current)
  const similarProducts = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* TopNavBar */}
      <Header />

      {/* Main Content Container */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <div className="mb-6">
          <Link href="/shop" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {t("শপে ফিরে যান", "Back to Shop")}
          </Link>
        </div>

        {/* Product Details Section */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-variant/40 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Image side */}
          <div className="aspect-square rounded-xl overflow-hidden bg-white border border-outline-variant/30 relative">
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-gradient-orange text-white px-3 py-1.5 rounded-lg font-micro text-label-sm font-bold z-10 shadow-sm">
                {language === "bn"
                  ? `${activeDiscountPercent?.toLocaleString("bn-BD")}% ছাড়`
                  : `${activeDiscountPercent}% OFF`}
              </div>
            )}
            <img
              className="w-full !h-full object-cover"
              src={product.image}
              alt={t(product.nameBn, product.nameEn)}
            />
          </div>

          {/* Details side */}
          <div className="flex flex-col">
            <h1 className="font-tiro text-3xl font-bold text-on-surface mb-2">
              {t(product.nameBn, product.nameEn)}
            </h1>

            {/* Default or size unit display */}
            <p className="text-label-md text-muted font-bold mb-4">
              {t("প্যাকেজ সাইজ: ", "Unit: ")} {selectedSize ? t(selectedSize.nameBn, selectedSize.nameEn) : t(product.unitBn, product.unitEn)}
            </p>

            {/* Price Display: Discounted Price and original struck through if discount exists */}
            <div className="flex items-center gap-4 mb-6">
              <div className="font-headline-lg text-3xl font-bold text-primary flex items-baseline gap-1">
                <span>৳</span>
                <span>{formattedPrice}</span>
              </div>
              {hasDiscount && (
                <div className="text-lg text-muted line-through">
                  ৳{formattedOriginalPrice}
                </div>
              )}
            </div>

            {/* Pack Size Selector Buttons (Dynamic based on product data) */}
            {product.packSizes && product.packSizes.length > 0 && (
              <div className="mb-6">
                <span className="block text-sm font-bold text-on-surface mb-2">
                  {t("প্যাকেজ নির্বাচন করুন:", "Select Package:")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.packSizes.map((size, idx) => {
                    const isSelected = selectedSize?.nameEn === size.nameEn;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all btn-press cursor-pointer ${
                          isSelected
                            ? "bg-primary border-primary text-white shadow-sm"
                            : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        {t(size.nameBn, size.nameEn)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="border-t border-b border-surface-variant/50 py-4 mb-6">
              <h3 className="font-headline-sm font-bold text-on-surface mb-2">
                {t("পণ্যের বিবরণ", "Product Details")}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t(
                  product.descriptionBn || "তাজা ও স্বাস্থ্যসম্মত পণ্য। সরাসরি খামার থেকে সংগৃহীত।",
                  product.descriptionEn || "Fresh and healthy product. Sourced directly from local farms."
                )}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-bold text-on-surface">{t("পরিমাণ:", "Quantity:")}</span>
              <div className="flex items-center border border-outline-variant rounded-full bg-surface">
                <button
                  onClick={decrementQty}
                  className="w-10 h-10 flex items-center justify-center text-on-surface hover:text-primary transition-colors btn-press cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="w-12 text-center text-sm font-bold">
                  {language === "bn" ? quantity.toLocaleString("bn-BD") : quantity}
                </span>
                <button
                  onClick={incrementQty}
                  className="w-10 h-10 flex items-center justify-center text-on-surface hover:text-primary transition-colors btn-press cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>

            {/* Add & Buy Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                className="flex-grow bg-surface border border-primary text-primary font-bold py-3.5 px-6 rounded-full btn-press transition-colors hover:bg-primary/5 cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                {t("কার্টে যোগ করুন", "Add to Cart")}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-grow bg-gradient-green text-white font-bold py-3.5 px-6 rounded-full btn-press shadow-md hover:shadow-lg transition-transform cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
                {t("সরাসরি কিনুন", "Buy Now")}
              </button>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-6">
              {t("অনুরূপ কিছু পণ্য", "Related Products")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((p) => {
                const pPrice = p.discountPrice !== undefined ? p.discountPrice : p.price;
                const pFormattedPrice = language === "bn" ? pPrice.toLocaleString("bn-BD") : pPrice;
                return (
                  <div
                    key={p.id}
                    className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-variant hover-lift flex flex-col h-full relative"
                  >
                    <Link href={`/product/${p.slug}`} className="aspect-square w-full rounded-xl overflow-hidden bg-surface-container mb-3 relative block">
                      <img className="w-full h-full object-cover" src={p.image} alt={p.nameEn} />
                    </Link>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 line-clamp-2">
                      <Link href={`/product/${p.slug}`} className="hover:text-primary transition-colors">
                        {t(p.nameBn, p.nameEn)}
                      </Link>
                    </h3>
                    <p className="font-label-sm text-label-sm text-muted mb-2">
                      {t(p.unitBn, p.unitEn)}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="font-headline-md text-headline-md text-primary">
                        ৳{pFormattedPrice}
                      </div>
                      <button
                        onClick={() => addToCart(p, 1)}
                        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center btn-press cursor-pointer hover:bg-primary-dark transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Mobile bottom nav: Balanced icons, removed Profile, added Home & Cart shortcuts */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] bg-surface dark:bg-inverse-surface rounded-t-2xl border-t border-surface-variant">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-2xl px-3 py-1 scale-94 transition-all duration-150"
        >
          <span className="material-symbols-outlined text-primary" data-icon="home">
            home
          </span>
          <span className="font-label-sm text-label-sm mt-1">{t("হোম", "Home")}</span>
        </Link>
        <Link
          href="/shop"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-2xl px-3 py-1 scale-94 transition-all duration-150"
        >
          <span className="material-symbols-outlined text-primary" data-icon="store">
            store
          </span>
          <span className="font-label-sm text-label-sm mt-1">{t("শপ", "Shop")}</span>
        </Link>
        <Link
          href="/shop?cat=all"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-2xl px-3 py-1 scale-94 transition-all duration-150"
        >
          <span className="material-symbols-outlined text-primary" data-icon="grid_view">
            grid_view
          </span>
          <span className="font-label-sm text-label-sm mt-1">{t("ক্যাটাগরি", "Categories")}</span>
        </Link>
        <Link
          href="/cart"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-2xl px-3 py-1 scale-94 transition-all duration-150"
        >
          <span className="material-symbols-outlined text-primary" data-icon="shopping_cart">
            shopping_cart
          </span>
          <span className="font-label-sm text-label-sm mt-1">{t("কার্ট", "Cart")}</span>
        </Link>
      </nav>

      {/* Footer */}
      <Footer />
    </div>
  );
}
