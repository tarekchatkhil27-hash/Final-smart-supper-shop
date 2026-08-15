"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useApp();

  const handleLogout = () => {
    // Clear admin authentication state if any (we can use sessionStorage for now)
    sessionStorage.removeItem("sss_admin_auth");
    router.push("/admin");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-[#1F2937] text-gray-300 h-screen sticky top-0 flex flex-col shadow-lg border-r border-gray-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-green flex items-center justify-center shadow-md">
          <i className="fas fa-user-shield text-white text-base"></i>
        </div>
        <div>
          <h1 className="text-white font-bold text-base leading-none">Smart Shop</h1>
          <span className="text-xs text-primary font-semibold">{t("প্যানেল", "Admin Panel")}</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-grow p-4 space-y-2">
        <Link
          href="/admin/products"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive("/admin/products")
              ? "bg-primary text-white font-semibold"
              : "hover:bg-gray-800 hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          <span>{t("পণ্য ব্যবস্থাপনা", "Manage Products")}</span>
        </Link>

        <Link
          href="/admin/orders"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive("/admin/orders")
              ? "bg-primary text-white font-semibold"
              : "hover:bg-gray-800 hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">orders</span>
          <span>{t("অর্ডার ব্যবস্থাপনা", "Manage Orders")}</span>
        </Link>

        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive("/admin/settings")
              ? "bg-primary text-white font-semibold"
              : "hover:bg-gray-800 hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>{t("সেটিংস", "Settings")}</span>
        </Link>
      </nav>

      {/* Footer Nav */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-gray-800 hover:text-white text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">store</span>
          <span>{t("দোকানে ফিরে যান", "Back to Shop")}</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left hover:bg-red-900/30 text-red-400 hover:text-red-300 text-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>{t("লগআউট", "Logout")}</span>
        </button>
      </div>
    </aside>
  );
};
