"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useApp } from "@/context/AppContext";

export default function TermsPage() {
  const { t } = useApp();

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col antialiased overflow-hidden">
      <Header />
      
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24 flex flex-col items-center justify-center">
        
        {/* Beautiful Hero Card with Gradients & Glassmorphism */}
        <div className="relative w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white border border-outline-variant/30 hover-lift group transition-all duration-500">
          
          {/* Background Decorative Blobs */}
          <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-blue-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-[0.15] animate-pulse transition-opacity duration-1000"></div>
          <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] bg-purple-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-[0.15] animate-pulse transition-opacity duration-1000" style={{ animationDelay: "1.5s" }}></div>
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[60px] opacity-[0.15] animate-pulse transition-opacity duration-1000" style={{ animationDelay: "0.5s" }}></div>
          
          <div className="relative z-10 p-10 md:p-20 flex flex-col items-center text-center">
            
            {/* Animated Icon Banner */}
            <div className="flex gap-5 mb-10">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 shadow-sm border border-blue-500/20">
                <span className="material-symbols-outlined text-blue-600 text-[32px]">gavel</span>
              </div>
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 delay-[50ms] shadow-sm border border-purple-500/20">
                <span className="material-symbols-outlined text-purple-600 text-[32px]">assignment</span>
              </div>
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 delay-[100ms] shadow-sm border border-indigo-500/20">
                <span className="material-symbols-outlined text-indigo-600 text-[32px]">verified_user</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-[36px] md:text-[52px] font-bold text-[#003366] mb-8 tracking-tight font-tiro drop-shadow-sm">
              {t("শর্তাবলী", "Terms and Conditions")}
            </h1>
            
            <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-10 group-hover:w-32 transition-all duration-700 ease-out"></div>

            {/* Content Text */}
            <p className="font-body-lg text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-3xl font-medium">
              {t(
                "আমাদের ওয়েবসাইটে অর্ডার করার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মতি প্রদান করছেন। পণ্যের মূল্য, প্রাপ্যতা এবং অফার প্রয়োজনে পূর্ব নোটিশ ছাড়াই পরিবর্তন হতে পারে। সঠিক তথ্য প্রদান এবং সময়মতো অর্ডার গ্রহণের দায়িত্ব গ্রাহকের।",
                "By placing an order on our website, you agree to our terms and conditions. Product prices, availability, and offers are subject to change without prior notice if necessary. Providing accurate information and receiving orders on time is the customer's responsibility."
              )}
            </p>
            
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
