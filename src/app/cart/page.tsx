"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useApp } from "@/context/AppContext";

export default function CartPage() {
  const { t, cart, updateQuantity, removeFromCart, cartTotal, language } = useApp();

  // Calculate costs based on item properties
  const originalSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const activeSubtotal = cartTotal; // already incorporates discount price if present
  const totalDiscount = originalSubtotal - activeSubtotal;

  const deliveryCharge = cart.length > 0 ? 50 : 0;
  const grandTotal = activeSubtotal + deliveryCharge;

  // Formatting helper
  const f = (num: number) => (language === "bn" ? num.toLocaleString("bn-BD") : num);

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col antialiased">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
        
        {cart.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
            <span className="material-symbols-outlined text-[64px] text-muted mb-4">shopping_cart_off</span>
            <h2 className="text-headline-md font-headline-md text-on-surface mb-2">
              {t("আপনার কার্টটি বর্তমানে খালি", "Your cart is currently empty")}
            </h2>
            <p className="text-body-md font-body-md text-on-surface-variant mb-6 max-w-md">
              {t(
                "আপনার পছন্দের পণ্যগুলো খুঁজতে শুরু করুন এবং দারুণ সব অফার উপভোগ করুন!",
                "Start searching for your favorite products and enjoy great offers!"
              )}
            </p>
            <Link
              href="/shop"
              className="border border-primary text-primary hover:bg-primary/5 rounded-full py-2.5 px-6 font-label-md text-label-md transition-colors flex items-center gap-2 btn-press"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              {t("কেনাকাটা চালিয়ে যান", "Continue Shopping")}
            </Link>
          </div>
        ) : (
          /* Active Cart View */
          <>
            <div className="mb-section-gap flex items-center gap-2">
              <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">
                {t("আপনার কার্ট", "Your Cart")}
              </h1>
              <span className="bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-full text-label-md font-label-md">
                {f(cart.length)} {t("টি পণ্য", "items")}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-section-gap items-start">
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {cart.map((item) => {
                  const activePrice = item.discountPrice !== undefined ? item.discountPrice : item.price;
                  const itemTotal = activePrice * item.quantity;
                  const itemOriginalTotal = item.price * item.quantity;
                  const hasItemDiscount = item.discountPrice !== undefined;

                  return (
                    <div
                      key={item.id}
                      className="bg-surface-container-lowest rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-outline-variant/30 relative overflow-hidden group"
                    >
                      {/* Product Image */}
                      <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] shrink-0 bg-white rounded-xl overflow-hidden border border-outline-variant/30">
                        <img
                          className="w-full !h-full object-cover"
                          src={item.image}
                          alt={t(item.nameBn, item.nameEn)}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow flex flex-col justify-between h-full w-full">
                        <div className="flex justify-between items-start mb-2 w-full">
                          <div>
                            <h3 className="text-headline-sm font-headline-sm text-on-surface mb-1">
                              {t(item.nameBn, item.nameEn)}
                            </h3>
                            <p className="text-label-md font-label-md text-on-surface-variant">
                              {t("প্যাকেজ: ", "Package: ")} {t(item.unitBn, item.unitEn)}
                            </p>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Remove item"
                            className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-full hover:bg-error-container/20 focus:outline-none cursor-pointer btn-press"
                          >
                            <span className="material-symbols-outlined text-[20px] align-middle">delete</span>
                          </button>
                        </div>

                        <div className="flex justify-between items-end mt-auto w-full gap-4">
                          {/* Quantity Stepper */}
                          <div className="flex items-center bg-surface-container rounded-full border border-outline-variant/50 overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container-high active:bg-surface-variant transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">remove</span>
                            </button>
                            <span className="w-10 text-center text-body-md font-body-md">
                              {f(item.quantity)}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container-high active:bg-surface-variant transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">add</span>
                            </button>
                          </div>

                          {/* Price Display */}
                          <div className="text-right">
                            {hasItemDiscount && (
                              <div className="text-label-sm font-label-sm text-on-surface-variant line-through opacity-70">
                                ৳{f(itemOriginalTotal)}
                              </div>
                            )}
                            <div className="text-headline-md font-headline-md text-primary font-bold">
                              ৳{f(itemTotal)}
                            </div>
                            <div className="text-[10px] text-on-surface-variant mt-0.5">
                              ৳{f(activePrice)} / {t(item.unitBn.replace(/\d+\s*/, ""), item.unitEn.replace(/\d+\s*/, ""))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="lg:col-span-4">
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 border border-outline-variant/30 sticky top-24">
                  <h2 className="text-headline-sm font-headline-sm text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                    {t("অর্ডার সারসংক্ষেপ", "Order Summary")}
                  </h2>

                  {/* Costs Breakdown */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-outline-variant/30 text-sm">
                    <div className="flex justify-between items-center text-on-surface">
                      <span>{t(`উপ-মোট (${cart.length}টি পণ্য)`, `Subtotal (${cart.length} items)`)}</span>
                      <span className="font-semibold">৳{f(originalSubtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-on-surface">
                      <span>{t("ডেলিভারি চার্জ", "Delivery Charge")}</span>
                      <span className="font-semibold text-on-surface-variant">৳{f(deliveryCharge)}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between items-center text-on-surface">
                        <span>{t("ডিসকাউন্ট", "Discounts")}</span>
                        <span className="font-semibold text-error">- ৳{f(totalDiscount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-headline-sm font-headline-sm text-on-surface font-bold">
                      {t("সর্বমোট", "Grand Total")}
                    </span>
                    <div className="text-right">
                      <span className="text-headline-lg font-headline-lg text-primary font-bold block">
                        ৳{f(grandTotal)}
                      </span>
                      <span className="text-micro font-micro text-on-surface-variant">
                        {t("ভ্যাট/ট্যাক্স অন্তর্ভুক্ত", "VAT/Tax Included")}
                      </span>
                    </div>
                  </div>

                  {/* Action Checkout button */}
                  <Link
                    href="/checkout"
                    className="w-full text-on-primary bg-primary rounded-full py-3 px-4 font-headline-sm text-headline-sm shadow-sm hover:shadow-md hover:bg-primary-dark transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 bg-gradient-green cursor-pointer"
                  >
                    {t("অর্ডার নিশ্চিত করুন", "Proceed to Checkout")}
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </Link>

                  <div className="mt-4 flex items-center justify-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                    {t("নিরাপদ পেমেন্ট গ্যারান্টিড", "Secure Payment Guaranteed")}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
