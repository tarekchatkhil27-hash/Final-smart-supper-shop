"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { insforge } from "@/lib/insforge";

export default function CheckoutPage() {
  const router = useRouter();
  const { t, cart, cartTotal, clearCart, language } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryFeeSetting, setDeliveryFeeSetting] = useState(0);

  // Form Fields State
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [village, setVillage] = useState("");
  const [thana, setThana] = useState("");
  const [district, setDistrict] = useState("");

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Subtotal & summary details
  const originalSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const activeSubtotal = cartTotal;
  const totalDiscount = originalSubtotal - activeSubtotal;
  const deliveryCharge = cart.length > 0 ? deliveryFeeSetting : 0;
  const grandTotal = activeSubtotal + deliveryCharge;

  // Language formatting helper
  const f = (num: number) => (language === "bn" ? num.toLocaleString("bn-BD") : num);

  // Redirect if cart is empty, also fetch settings
  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
      return;
    }

    const fetchSettings = async () => {
      const { data } = await insforge.database
        .from("Settings")
        .select("delivery_fee")
        .eq("id", 1)
        .single();
      if (data) {
        setDeliveryFeeSetting(Number(data.delivery_fee) || 0);
      }
    };
    fetchSettings();
  }, [cart, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!phone.trim()) {
      newErrors.phone = t("মোবাইল নম্বর আবশ্যক", "Mobile number is required");
    } else if (!/^01\d{9}$/.test(phone.trim())) {
      newErrors.phone = t("সঠিক মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)", "Provide a valid 11-digit mobile number");
    }

    if (!name.trim()) {
      newErrors.name = t("আপনার নাম আবশ্যক", "Your name is required");
    }

    if (!address.trim()) {
      newErrors.address = t("ঠিকানা আবশ্যক", "Delivery address is required");
    }

    if (!village.trim()) {
      newErrors.village = t("গ্রাম/মহল্লা আবশ্যক", "Village/Mohalla is required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    // Format full delivery address string
    const fullAddress = [address, village, thana, district]
      .map(part => part.trim())
      .filter(Boolean)
      .join(", ");

    // Generate UUID in the frontend so we don't need a SELECT policy on Orders for public users
    const orderId = crypto.randomUUID();

    // Insert Order into InsForge
    const { error: orderError } = await insforge.database.from("Orders").insert([{
      id: orderId,
      customer_email: phone + "@placeholder.com",
      customer_name: name,
      customer_phone: phone,
      customer_address: fullAddress,
      total_amount: grandTotal,
      delivery_fee: deliveryCharge,
      status: "Pending Payment"
    }]);

    if (orderError) {
      alert("Error placing order: " + (orderError?.message || "Unknown error"));
      setIsSubmitting(false);
      return;
    }

    // Insert Order Items into InsForge
    const itemsToInsert = cart.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_time: item.discountPrice !== undefined ? item.discountPrice : item.price
    }));

    const { error: itemsError } = await insforge.database.from("Order_Items").insert(itemsToInsert);

    if (itemsError) {
      alert("Error placing order items: " + itemsError.message);
      setIsSubmitting(false);
      return;
    }

    // Generate simulated order data to pass to confirmation page quickly
    const orderDataSession = {
      orderId: orderId,
      customerName: name,
      phone,
      address: fullAddress,
      items: cart.map((item) => ({
        productId: item.productId,
        nameBn: item.nameBn,
        nameEn: item.nameEn,
        price: item.discountPrice !== undefined ? item.discountPrice : item.price,
        quantity: item.quantity,
        unitBn: item.unitBn,
        unitEn: item.unitEn,
        image: item.image
      })),
      totalAmount: grandTotal,
      subtotal: activeSubtotal,
      discount: totalDiscount,
      deliveryCharge,
      createdAt: new Date().toISOString(),
    };

    // Store order summary details in sessionStorage
    sessionStorage.setItem("sss_last_order", JSON.stringify(orderDataSession));

    // Navigate to order-confirmation
    router.push("/order-confirmation");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-primary font-bold text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
      {/* Transactional Simplified Header */}
      <header className="w-full bg-surface-container-lowest shadow-sm py-4 px-margin-mobile md:px-margin-desktop sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0 select-none">
            <img src="/sss_logo.png" alt="SSS Shopping Cart Logo" className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] object-contain shrink-0" />
            <span className="font-headline-sm text-[16px] md:text-[20px] font-bold text-[#003366] tracking-tight whitespace-nowrap font-tiro">
              Smart supper Shop
            </span>
          </Link>
          <Link href="/cart" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {t("কার্টে ফিরে যান", "Back to Cart")}
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-6 md:py-10">
        {/* Step Indicator */}
        <div className="mb-10 max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-surface-variant z-0 rounded-full"></div>
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md mb-2 shadow-md ring-4 ring-surface-container-lowest">
                1
              </div>
              <span className="font-label-md text-label-md text-primary font-bold text-center">
                {t("যোগাযোগ ও শিপিং", "Shipping Details")}
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-label-md text-label-md mb-2 ring-4 ring-surface-container-lowest">
                2
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant text-center">
                {t("পেমেন্ট", "Payment Method")}
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-label-md text-label-md mb-2 ring-4 ring-surface-container-lowest">
                3
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant text-center">
                {t("অর্ডার রিভিউ", "Order Review")}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-section-gap md:gap-8 items-start">
          
          {/* Left Column: Delivery Form */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-surface-variant/40">
              <div className="flex items-center gap-3 mb-6 border-b border-surface-variant/30 pb-4">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  {t("ডেলিভারি তথ্য", "Delivery Information")}
                </h2>
              </div>

              <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                {/* Mobile Number */}
                <div className="md:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5 ml-1">
                    {t("মোবাইল নম্বর", "Mobile Number")} <span className="text-error">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    className={`w-full bg-surface rounded-full border px-5 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${
                      errors.phone ? "border-error" : "border-outline-variant/60"
                    }`}
                    placeholder="01XXX-XXXXXX"
                  />
                  {errors.phone && <p className="text-error text-xs mt-1.5 ml-3 font-semibold">{errors.phone}</p>}
                </div>

                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5 ml-1">
                    {t("নাম", "Name")} <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    className={`w-full bg-surface rounded-full border px-5 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${
                      errors.name ? "border-error" : "border-outline-variant/60"
                    }`}
                    placeholder={t("আপনার সম্পূর্ণ নাম", "Your full name")}
                  />
                  {errors.name && <p className="text-error text-xs mt-1.5 ml-3 font-semibold">{errors.name}</p>}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5 ml-1">
                    {t("ঠিকানা", "Address")} <span className="text-error">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors((prev) => ({ ...prev, address: "" }));
                    }}
                    className={`w-full bg-surface rounded-2xl border px-5 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none h-24 ${
                      errors.address ? "border-error" : "border-outline-variant/60"
                    }`}
                    placeholder={t("বাড়ির নম্বর, রাস্তার নাম, ফ্ল্যাট নম্বর", "House no, Street name, Flat no")}
                  />
                  {errors.address && <p className="text-error text-xs mt-1.5 ml-3 font-semibold">{errors.address}</p>}
                </div>

                {/* Village / Mohalla */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5 ml-1">
                    {t("গ্রাম/মহল্লা", "Village/Area")} <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => {
                      setVillage(e.target.value);
                      if (errors.village) setErrors((prev) => ({ ...prev, village: "" }));
                    }}
                    className={`w-full bg-surface rounded-full border px-5 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${
                      errors.village ? "border-error" : "border-outline-variant/60"
                    }`}
                    placeholder={t("গ্রাম বা এলাকার নাম", "Village or Area name")}
                  />
                  {errors.village && <p className="text-error text-xs mt-1.5 ml-3 font-semibold">{errors.village}</p>}
                </div>

                {/* Upazila / Thana */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5 ml-1">
                    {t("উপজেলা/থানা (ঐচ্ছিক)", "Upazila/Thana (Optional)")}
                  </label>
                  <input
                    type="text"
                    value={thana}
                    onChange={(e) => {
                      setThana(e.target.value);
                      if (errors.thana) setErrors((prev) => ({ ...prev, thana: "" }));
                    }}
                    className={`w-full bg-surface rounded-full border px-5 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${
                      errors.thana ? "border-error" : "border-outline-variant/60"
                    }`}
                    placeholder={t("উপজেলার নাম", "Thana or Upazila name")}
                  />
                  {errors.thana && <p className="text-error text-xs mt-1.5 ml-3 font-semibold">{errors.thana}</p>}
                </div>

                {/* District Dropdown */}
                <div className="md:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5 ml-1">
                    {t("জেলা (ঐচ্ছিক)", "District (Optional)")}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (errors.district) setErrors((prev) => ({ ...prev, district: "" }));
                    }}
                    className={`w-full bg-surface rounded-full border px-5 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${
                      errors.district ? "border-error" : "border-outline-variant/60"
                    }`}
                    placeholder={t("জেলার নাম", "District name")}
                  />
                  {errors.district && (
                    <p className="text-error text-xs mt-1.5 ml-3 font-semibold">{errors.district}</p>
                  )}
                </div>
              </form>
            </section>

            {/* Payment Method COD */}
            <section className="bg-primary-container/10 rounded-2xl p-6 shadow-sm border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-green text-white flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                  {t(
                    "পেমেন্ট পদ্ধতি: ক্যাশ অন ডেলিভারি (ম্যানুয়াল পেমেন্ট)",
                    "Payment Method: Cash on Delivery"
                  )}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {t(
                    "পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।",
                    "Pay with cash after receiving your products. No advance online payment is required."
                  )}
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-md border border-surface-variant/30 sticky top-24">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-5 pb-4 border-b border-surface-variant/30 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                {t("অর্ডার সামারি", "Order Summary")}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                  <span>
                    {t(`উপ-মোট (${cart.length}টি আইটেম)`, `Subtotal (${cart.length} items)`)}
                  </span>
                  <span className="font-bold text-on-surface">৳ {f(originalSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                  <span>{t("ডেলিভারি চার্জ", "Delivery Charge")}</span>
                  <span className="font-bold text-on-surface">৳ {f(deliveryCharge)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center font-body-md text-body-md text-primary-container">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">loyalty</span>
                      {t("ডিসকাউন্ট", "Discounts")}
                    </span>
                    <span className="font-bold text-error">- ৳ {f(totalDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-outline-variant pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-headline-sm text-headline-sm text-on-surface">{t("সর্বমোট", "Grand Total")}</span>
                  <span className="font-headline-lg text-headline-lg text-primary font-bold">
                    ৳ {f(grandTotal)}
                  </span>
                </div>
                <p className="font-micro text-micro text-on-surface-variant mt-1 text-right">
                  {t("ভ্যাট সহ", "VAT Included")}
                </p>
              </div>

              <button
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-green text-on-primary font-label-md text-label-md py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-[2px] active:scale-95 flex justify-center items-center gap-2 cursor-pointer font-bold text-[15px] disabled:opacity-50"
              >
                <span className="material-symbols-outlined">check_circle</span>
                {isSubmitting ? t("অপেক্ষা করুন...", "Please wait...") : t("অর্ডার প্লেস করুন", "Place Order")}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-on-surface-variant font-micro text-micro bg-surface-container-high px-3 py-2 rounded-full w-fit mx-auto">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <span>{t("নিরাপদ ও এনক্রিপ্টেড চেকআউট", "Secure and Encrypted Checkout")}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
