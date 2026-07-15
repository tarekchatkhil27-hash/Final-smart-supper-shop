"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="w-full mt-auto py-12 px-margin-mobile md:px-margin-desktop bg-[#111827] text-gray-400">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center gap-2.5 mb-8">
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/sss_logo.png"
              alt="SSS Shopping Cart Logo"
              className="w-[50px] h-[50px] object-contain rounded-lg bg-white p-0.5 shrink-0"
            />
          </Link>
          <div>
            <div className="text-white font-bold text-xl">Smart Supper Shop</div>
            <div className="text-gray-400 text-sm">
              {t("বাজার এখন ঘরে | Since 2024", "Market is now at home | Since 2024")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-white font-semibold text-base mb-4">{t("দ্রুত লিঙ্ক", "Quick Links")}</div>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  {t("আমাদের সম্পর্কে", "About Us")}
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  {t("ক্যারিয়ার", "Careers")}
                </a>
              </li>
              <li>
                <Link href="/shop" className="text-sm hover:text-white transition-colors">
                  {t("আজকের অফার", "Today's Offer")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors">
                  {t("যোগাযোগ করুন", "Contact Us")}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm hover:text-white transition-colors text-primary font-semibold">
                  {t("এডমিন", "Admin")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold text-base mb-4">{t("গ্রাহক সেবা", "Customer Service")}</div>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm hover:text-white transition-colors">
                  {t("শর্তাবলী", "Terms & Conditions")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                  {t("গোপনীয়তা নীতি", "Privacy Policy")}
                </Link>
              </li>
              <li>
                <Link href="/return" className="text-sm hover:text-white transition-colors">
                  {t("রিটার্ন পলিসি", "Return Policy")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-2 rounded-2xl p-6 bg-[#1F2937]">
            <div className="text-white text-base font-semibold mb-4">{t("যোগাযোগ করুন", "Contact Us")}</div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <i className="fas fa-phone text-primary text-base w-5 text-center"></i>
                <span>{t("১৬৪৭৮ (সকাল ৮টা – রাত ১০টা)", "16478 (8:00 AM – 10:00 PM)")}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <i className="fas fa-envelope text-primary text-base w-5 text-center"></i>
                <span>support@smartsupershop.com.bd</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <i className="fas fa-map-marker-alt text-primary text-base w-5 text-center"></i>
                <span>{t("ঢাকা, চট্টগ্রাম, সিলেট, রাজশাহী", "Dhaka, Chittagong, Sylhet, Rajshahi")}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <span className="text-gray-400 text-sm">{t("ফলো করুন:", "Follow us:")}</span>
              <button className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center hover:scale-110 transition-transform btn-press cursor-pointer">
                <i className="fab fa-facebook-f text-white text-sm"></i>
              </button>
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform btn-press cursor-pointer"
                style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}
              >
                <i className="fab fa-instagram text-white text-sm"></i>
              </button>
              <button className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:scale-110 transition-transform btn-press cursor-pointer">
                <i className="fab fa-youtube text-white text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 border-[#374151]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">
              © {t("২০২৪ Smart Supper Shop. সর্বস্বত্ব সংরক্ষিত।", "2024 Smart Supper Shop. All rights reserved.")}
            </div>
            <div className="text-sm">
              {t("Made with ❤️ in Bangladesh", "Made with ❤️ in Bangladesh")}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
