"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useApp } from "@/context/AppContext";

export default function PrivacyPage() {
  const { t } = useApp();

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col antialiased overflow-hidden">
      <Header />
      
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24 flex flex-col items-center justify-center">
        
        {/* Beautiful Hero Card with Gradients & Glassmorphism */}
        <div className="relative w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white border border-outline-variant/30 hover-lift group transition-all duration-500">
          
          {/* Background Decorative Blobs */}
          <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-rose-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-[0.15] animate-pulse transition-opacity duration-1000"></div>
          <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] bg-pink-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-[0.15] animate-pulse transition-opacity duration-1000" style={{ animationDelay: "1.5s" }}></div>
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-red-300 rounded-full mix-blend-multiply filter blur-[60px] opacity-[0.15] animate-pulse transition-opacity duration-1000" style={{ animationDelay: "0.5s" }}></div>
          
          <div className="relative z-10 p-10 md:p-20 flex flex-col items-center text-center">
            
            {/* Animated Icon Banner */}
            <div className="flex gap-5 mb-10">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 shadow-sm border border-rose-500/20">
                <span className="material-symbols-outlined text-rose-600 text-[32px]">shield_lock</span>
              </div>
              <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 delay-[50ms] shadow-sm border border-pink-500/20">
                <span className="material-symbols-outlined text-pink-600 text-[32px]">security</span>
              </div>
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 delay-[100ms] shadow-sm border border-red-500/20">
                <span className="material-symbols-outlined text-red-600 text-[32px]">policy</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-[36px] md:text-[52px] font-bold text-[#003366] mb-8 tracking-tight font-tiro drop-shadow-sm">
              {t("গোপনীয়তা নীতি", "Privacy Policy")}
            </h1>
            
            <div className="w-20 h-1.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full mb-10 group-hover:w-32 transition-all duration-700 ease-out"></div>

            {/* Content Text */}
            <p className="font-body-lg text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-3xl font-medium">
              {t(
                "আপনার নাম, ফোন নম্বর ও ঠিকানাসহ ব্যক্তিগত তথ্য শুধুমাত্র অর্ডার প্রক্রিয়াকরণ ও ডেলিভারির জন্য ব্যবহার করা হয়। আপনার অনুমতি ছাড়া এসব তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হবে না।",
                "Your personal information, including name, phone number, and address, is only used for order processing and delivery. Without your permission, this information will not be sold or shared with any third party."
              )}
            </p>
            
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
