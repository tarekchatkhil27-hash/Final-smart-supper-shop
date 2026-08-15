"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { insforge } from "@/lib/insforge";

interface OrderItem {
  productId: string;
  nameBn: string;
  nameEn: string;
  price: number;
  quantity: number;
  unitBn: string;
  unitEn: string;
  image?: string; // Optional image fallback
}

interface SimulatedOrder {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { t, clearCart, language } = useApp();
  const [order, setOrder] = useState<SimulatedOrder | null>(null);
  const [shortOrderId, setShortOrderId] = useState<string>("");

  // Retrieve last order from sessionStorage
  useEffect(() => {
    // Clear the cart context once the order confirmation page successfully mounts
    // This prevents race condition redirects in checkout
    clearCart();

    const savedOrder = sessionStorage.getItem("sss_last_order");
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        setOrder(parsed);
        
        // Fetch the stable short order ID from the database
        insforge.database.rpc("get_order_short_id", { order_uuid: parsed.orderId }).then(({ data }) => {
          if (data) setShortOrderId(data as string);
        });
      } catch (e) {
        console.error("Failed to parse simulated order details", e);
      }
    } else {
      // Fallback fallback details for demo purposes if direct navigate
      setOrder({
        orderId: "SSS-84920",
        customerName: "মোহাম্মদ করিম",
        phone: "01712345678",
        address: "বাসা ৫, রোড ১০, ধানমন্ডি, ঢাকা",
        items: [
          {
            productId: "1",
            nameBn: "প্রিমিয়াম মিনিকেট চাল",
            nameEn: "Premium Miniket Rice",
            price: 315,
            quantity: 1,
            unitBn: "৫ কেজি",
            unitEn: "5kg",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgbdEhf_QhiD73wVEVHhN8V7MPp4yvGK63tYc7NWGA5Z3mtfobzbT9YJNV8yOLIWHBMKIW6LMImopU3RrtuCuDcGC9GwjdiuChJoQ8DHemqP_txi-8b_IqdtPTlgrrh-QcrH_ltr_7aUNJfbKWTQ6HcDjiv_TMlV94ndDKe7JSsMVQ5GLymrxpBktz5COk6u4orMkw8SEpCFnjTpeRsoN87eAzNOcvuId4MatRsoPQjomBpBagK55OEg"
          },
          {
            productId: "3",
            nameBn: "দেশী মসুর ডাল",
            nameEn: "Local Lentils",
            price: 140,
            quantity: 2,
            unitBn: "১ কেজি",
            unitEn: "1kg",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUDWJYFqD4fJHLaaUwqQF3J2-TUqEPdEfuPW8I51_o7hha7ZR9GVYLK8rqyzGvIDSeUGMvTlOE4KtZT_a9Yn_REdG35hqqVIGc6olMzZsAvKYXfPDvAeRE0-h-d98Izf7_dep_RYkLt_h1FdTYvT3eYz-ATaSQIZVWQenM-nlR3dQLWe3Bvsyh4zNpj6STF5KPrP39ZoLXIlXVIyO1wuGdUEprNunJjZCb1NAFwEqdqHFzXL6cwN_wJw"
          }
        ],
        subtotal: 595,
        discount: 35,
        deliveryCharge: 50,
        totalAmount: 645,
        createdAt: new Date().toISOString()
      });
    }
  }, []);

  const handleContinueShopping = () => {
    clearCart();
    // Remove last order context to keep storage fresh
    sessionStorage.removeItem("sss_last_order");
    router.push("/shop");
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-primary font-bold">
        Loading confirmation details...
      </div>
    );
  }

  // Language formatting helper
  const f = (num: number) => (language === "bn" ? num.toLocaleString("bn-BD") : num);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      {/* Simplified Transaction Header */}
      <header className="w-full bg-white py-4 px-margin-mobile md:px-margin-desktop shadow-sm flex justify-center items-center z-50">
        <Link
          aria-label="Smart Supper Shop Home"
          className="flex items-center gap-2 md:gap-3 shrink-0 select-none"
          href="/"
        >
          <img src="/sss_logo.png" alt="SSS Shopping Cart Logo" className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] object-contain shrink-0" />
          <span className="font-headline-sm text-[16px] md:text-[20px] font-bold text-[#003366] tracking-tight whitespace-nowrap font-tiro">
            Smart supper Shop
          </span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-8 flex flex-col gap-8">
        
        {/* Success Banner */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm flex flex-col items-center text-center gap-4 border-t-4 border-primary">
          <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-primary text-4xl font-filled">check_circle</span>
          </div>
          <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-on-surface">
            {t("আপনার অর্ডারটি সফল হয়েছে!", "Your Order has been Placed Successfully!")}
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-md">
            {t("অর্ডার আইডি: ", "Order ID: ")}
            <br />
            <span className="font-mono text-lg font-bold text-on-surface bg-surface-container-high px-3 py-1.5 rounded mt-1 inline-block">
              {shortOrderId || order.orderId.substring(0, 8)}
            </span>
          </p>
        </section>

        {/* Payment Instructions Card */}
        <section className="bg-primary-container/10 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center text-center gap-4 border border-primary/20">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-primary text-3xl">payments</span>
          </div>
          <h2 className="text-headline-sm font-headline-sm text-on-surface">
            {t("ম্যানুয়াল পেমেন্ট নির্দেশিকা", "Manual Payment Instructions")}
          </h2>
          <div className="text-body-md font-body-md text-on-surface-variant max-w-lg space-y-3">
            <p>
              {t(
                "অনুগ্রহ করে বিকাশ (bKash), নগদ (Nagad), বা রকেট (Rocket) এর মাধ্যমে পেমেন্ট সম্পন্ন করুন।",
                "Please complete your payment via bKash, Nagad, or Rocket."
              )}
            </p>
            <div className="bg-surface p-4 rounded-xl border border-outline-variant/30 text-left w-full mx-auto my-4 max-w-sm">
              <p className="flex justify-between border-b border-outline-variant/30 pb-2 mb-2">
                <strong>{t("বিকাশ/নগদ (পার্সোনাল):", "bKash/Nagad (Personal):")}</strong>
                <span className="font-mono text-primary font-bold">০১৬২৯ ০১১৪৪৬</span>
              </p>
              <p className="flex justify-between">
                <strong>{t("মোট বিল:", "Total Amount:")}</strong>
                <span className="font-bold">৳{f(order.totalAmount)}</span>
              </p>
            </div>
            <p className="text-sm">
              {t(
                "পেমেন্ট সম্পন্ন করার পর আমাদের হেল্পলাইনে কল করে অথবা হোয়াটসঅ্যাপে মেসেজ দিয়ে অর্ডারটি নিশ্চিত করুন।",
                "After completing the payment, please confirm your order by calling our helpline or sending a message on WhatsApp."
              )}
            </p>
          </div>
        </section>

        {/* Delivery Address Card */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 border border-surface-variant/30 flex flex-col gap-3">
          <h2 className="text-headline-sm font-headline-sm text-on-surface border-b border-outline-variant/30 pb-2 flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            {t("ডেলিভারি ঠিকানা", "Delivery Information")}
          </h2>
          <div className="text-body-md text-on-surface-variant space-y-1">
            <p><strong className="text-on-surface font-semibold">{t("গ্রাহকের নাম: ", "Customer Name: ")}</strong>{order.customerName}</p>
            <p><strong className="text-on-surface font-semibold">{t("মোবাইল নম্বর: ", "Mobile Number: ")}</strong>{order.phone}</p>
            <p><strong className="text-on-surface font-semibold">{t("ডেলিভারি ঠিকানা: ", "Shipping Address: ")}</strong>{order.address}</p>
          </div>
        </section>

        {/* Order Details Receipt summary */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-surface-variant/30">
          <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant">
            <h2 className="text-headline-sm font-headline-sm text-on-surface">
              {t("অর্ডার সারসংক্ষেপ", "Order Details")}
            </h2>
          </div>

          <div className="p-6 flex flex-col gap-4">
            {/* Itemized list of purchased items */}
            {order.items.map((item, index) => {
              const itemImage =
                item.image ||
                "https://placehold.co/400x400?text=No+Image";

              return (
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-surface-container-highest last:border-0 last:pb-0">
                  <img
                    alt={t(item.nameBn, item.nameEn)}
                    className="w-16 h-16 object-cover rounded-lg bg-surface-container shadow-sm"
                    src={itemImage}
                  />
                  <div className="flex-grow">
                    <h3 className="text-body-md font-body-md font-bold text-on-surface">
                      {t(item.nameBn, item.nameEn)}
                    </h3>
                    <p className="text-label-md font-label-md text-on-surface-variant">
                      {t("পরিমাণ: ", "Qty: ")} {f(item.quantity)} {t(item.unitBn, item.unitEn)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-body-md font-body-md font-bold text-on-surface">
                      ৳{f(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Price Calculations Breakdown */}
            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-outline-variant">
              <div className="flex justify-between text-body-md font-body-md text-on-surface-variant">
                <span>{t("সাবটোটাল", "Subtotal")}</span>
                <span>৳{f(order.subtotal + order.discount)}</span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex justify-between text-body-md font-body-md text-on-surface-variant">
                  <span>{t("ডিসকাউন্ট", "Discounts")}</span>
                  <span className="text-error">- ৳{f(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-body-md font-body-md text-on-surface-variant">
                <span>{t("ডেলিভারি চার্জ", "Delivery Charge")}</span>
                <span>৳{f(order.deliveryCharge)}</span>
              </div>

              <div className="flex justify-between text-headline-sm font-headline-sm text-primary pt-4 mt-2 border-t border-outline-variant">
                <span>{t("সর্বমোট", "Grand Total")}</span>
                <span>৳{f(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Actions Button */}
        <div className="flex justify-center pb-12">
          <button
            onClick={handleContinueShopping}
            className="bg-gradient-green text-on-primary rounded-full px-8 py-4 flex items-center justify-center gap-2 w-full md:w-auto shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer font-bold"
          >
            <span className="text-headline-sm font-headline-sm">
              {t("কেনাকাটা চালিয়ে যান", "Continue Shopping")}
            </span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto px-margin-mobile md:px-margin-desktop border-t border-outline-variant bg-surface-container-lowest py-12 flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/sss_logo.png" alt="SSS Logo" className="h-[40px] w-[40px] object-contain" />
          <span className="text-headline-sm font-headline-sm text-primary font-bold">Smart Supper Shop</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <a
            className="text-body-md font-body-md text-on-surface-variant hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity"
            href="#"
          >
            {t("আমাদের সম্পর্কে", "About")}
          </a>
          <a
            className="text-body-md font-body-md text-on-surface-variant hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity"
            href="#"
          >
            {t("যোগাযোগ", "Contact")}
          </a>
          <a
            className="text-body-md font-body-md text-on-surface-variant hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity"
            href="#"
          >
            {t("রিটার্ন পলিসি", "Returns Policy")}
          </a>
          <a
            className="text-body-md font-body-md text-on-surface-variant hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity"
            href="#"
          >
            {t("প্রাইভেসি পলিসি", "Privacy Policy")}
          </a>
        </div>
        <p className="text-body-md font-body-md text-on-surface-variant">
          © 2026 Smart Supper Shop. {t("সর্বস্বত্ব সংরক্ষিত।", "All rights reserved.")}
        </p>
      </footer>
    </div>
  );
}
