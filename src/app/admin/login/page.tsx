"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { insforge } from "@/lib/insforge";

export default function AdminLoginPage() {
  const { t } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState("");



  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = t("ইমেইল ঠিকানা আবশ্যক", "Email address is required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("সঠিক ইমেইল দিন", "Please enter a valid email");
    }

    if (!password) {
      newErrors.password = t("পাসওয়ার্ড আবশ্যক", "Password is required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoginError("");
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(
        error.message ||
          t(
            "ভুল ইমেইল বা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিন।",
            "Invalid email or password! Please provide correct credentials."
          )
      );
    } else if (data?.user) {
      window.location.href = "/admin/products";
    }
  };

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop font-body-md text-on-surface">
      <main className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-lg p-6 md:p-10 border border-outline-variant/30 flex flex-col gap-6 md:gap-8">
        {/* Header */}
        <header className="flex flex-col items-center gap-2 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white border border-outline-variant/30 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden mb-2 p-1">
            <img src="/sss_logo.png" alt="SSS Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight font-bold">
            Smart Supper Shop
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant font-medium">
            {t("স্টোর এডমিনিস্ট্রেশন", "Store Administration")}
          </p>
        </header>

        {/* Global Error Banner */}
        {loginError && (
          <div className="bg-error-container/20 border border-error text-error text-sm rounded-xl p-3.5 text-center font-medium">
            {loginError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant font-bold" htmlFor="email">
              {t("ইমেইল ঠিকানা", "Email Address")}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-lg">
                mail
              </span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  if (loginError) setLoginError("");
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-surface rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none font-body-md text-body-md text-on-surface placeholder:text-muted/65 shadow-sm ${
                  errors.email ? "border-error" : "border-outline-variant"
                }`}
                placeholder="admin@smartsupershop.com"
              />
            </div>
            {errors.email && <p className="text-error text-xs font-semibold ml-1">{errors.email}</p>}
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant font-bold" htmlFor="password">
              {t("পাসওয়ার্ড", "Password")}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-lg">
                lock
              </span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  if (loginError) setLoginError("");
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-surface rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none font-body-md text-body-md text-on-surface placeholder:text-muted/65 shadow-sm ${
                  errors.password ? "border-error" : "border-outline-variant"
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-error text-xs font-semibold ml-1">{errors.password}</p>}
          </div>

          {/* Log In Button */}
          <button
            className="mt-2 w-full bg-gradient-green text-on-primary font-headline-sm text-headline-sm py-3 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-bold"
            type="submit"
          >
            <span>{t("লগইন করুন", "Log In")}</span>
            <span className="material-symbols-outlined text-lg font-filled">login</span>
          </button>
        </form>

        {/* Credentials Tip (Helpful for testing) */}
        <div className="text-center text-xs text-on-surface-variant bg-surface-container px-4 py-3 rounded-xl border border-outline-variant/30 flex flex-col gap-0.5">
          <span className="font-semibold text-primary">{t("ডেমো এডমিন তথ্য:", "Demo Admin Credentials:")}</span>
          <span className="font-mono text-[11px] font-bold">admin@smartsupershop.com / admin123</span>
        </div>

        {/* Footer info */}
        <div className="text-center mt-2 flex items-center justify-center gap-1 text-on-surface-variant/70">
          <span className="material-symbols-outlined text-sm align-middle">security</span>
          <span className="font-micro text-micro font-medium">{t("সুরক্ষিত পোর্টাল", "Secure Internal Portal")}</span>
        </div>
      </main>
    </div>
  );
}
