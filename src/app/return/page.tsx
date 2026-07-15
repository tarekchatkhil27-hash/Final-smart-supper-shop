"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useApp } from "@/context/AppContext";

export default function ReturnPage() {
  const { t } = useApp();

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col antialiased overflow-hidden">
      <Header />
      
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24 flex flex-col items-center justify-center">
        
        {/* Beautiful Hero Card with Gradients & Glassmorphism */}
        <div className="relative w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white border border-outline-variant/30 hover-lift group transition-all duration-500">
          
          {/* Background Decorative Blobs */}
          <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-yellow-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-[0.15] animate-pulse transition-opacity duration-1000"></div>
          <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] bg-orange-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-[0.15] animate-pulse transition-opacity duration-1000" style={{ animationDelay: "1.5s" }}></div>
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-amber-300 rounded-full mix-blend-multiply filter blur-[60px] opacity-[0.15] animate-pulse transition-opacity duration-1000" style={{ animationDelay: "0.5s" }}></div>
          
          <div className="relative z-10 p-10 md:p-20 flex flex-col items-center text-center">
            
            {/* Animated Icon Banner */}
            <div className="flex gap-5 mb-10">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 shadow-sm border border-orange-500/20">
                <span className="material-symbols-outlined text-orange-600 text-[32px]">assignment_return</span>
              </div>
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 delay-[50ms] shadow-sm border border-yellow-600/20">
                <span className="material-symbols-outlined text-yellow-600 text-[32px]">replay</span>
              </div>
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 delay-[100ms] shadow-sm border border-amber-500/20">
                <span className="material-symbols-outlined text-amber-600 text-[32px]">currency_exchange</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-[36px] md:text-[52px] font-bold text-[#003366] mb-8 tracking-tight font-tiro drop-shadow-sm">
              {t("রিটার্ন পলিসি", "Return Policy")}
            </h1>
            
            <div className="w-20 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-10 group-hover:w-32 transition-all duration-700 ease-out"></div>

            {/* Content Text */}
            <p className="font-body-lg text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-3xl font-medium">
              {t(
                "মেয়াদোত্তীর্ণ পণ্য সরবরাহ করা হলে ডেলিভারির ২৪ ঘণ্টার মধ্যে আমাদের জানান। যাচাই সাপেক্ষে পণ্য পরিবর্তন বা প্রযোজ্য ক্ষেত্রে অর্থ ফেরতের ব্যবস্থা করা হবে।",
                "If an expired product is supplied, please inform us within 24 hours of delivery. Subject to verification, a product replacement or applicable refund will be arranged."
              )}
            </p>
            
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
