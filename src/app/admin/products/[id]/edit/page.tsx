"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useApp } from "@/context/AppContext";
import { Product } from "@/context/AppContext";
import { insforge } from "@/lib/insforge";

interface AdminProduct extends Product {
  stock?: number;
  isActive?: boolean;
}

export default function AdminEditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const { t, language } = useApp();

  const [loading, setLoading] = useState(true);

  // Form states
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [descriptionBn, setDescriptionBn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [category, setCategory] = useState("grocery");
  const [isActive, setIsActive] = useState(true);

  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("100");

  const [discountType, setDiscountType] = useState<"none" | "percent" | "fixed">("none");
  const [discountValue, setDiscountValue] = useState("");

  const [packSizes, setPackSizes] = useState<string[]>([]);
  const [newSizeInput, setNewSizeInput] = useState("");

  const [image, setImage] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Auth guard is in layout but handled

    const loadProduct = async () => {
      const { data } = await insforge.database.from("Products").select().eq("id", id as string).single();
      if (data) {
        setNameEn(data.name || "");
        setNameBn(data.name || "");
        setDescriptionBn(data.description || "");
        setDescriptionEn(data.description || "");
        setPrice(data.price?.toString() || "0");
        setStock(data.stock?.toString() || "");
        setCategory(data.category || "grocery");
        setIsActive(true);
        
        let initDiscountType: "none" | "percent" | "fixed" = "none";
        let initDiscountValue = "";
        
        if (data.discount_percent) {
          initDiscountType = "percent";
          initDiscountValue = data.discount_percent.toString();
        } else if (data.discount_price && data.price) {
          initDiscountType = "fixed";
          initDiscountValue = (data.price - data.discount_price).toString();
        }

        setDiscountType(initDiscountType);
        setDiscountValue(initDiscountValue);
        
        if (data.unit) {
          setPackSizes([data.unit]);
        } else {
          setPackSizes([]);
        }
        
        setImage(data.image_url || "");
        setLoading(false);
      } else {
        alert(t("পণ্যটি পাওয়া যায়নি!", "Product not found!"));
        router.push("/admin/products");
      }
    };
    loadProduct();
  }, [id, router, t]);

  const handleAddSizeTag = (e: React.MouseEvent) => {
    e.preventDefault();
    const clean = newSizeInput.trim();
    if (clean && !packSizes.includes(clean)) {
      setPackSizes((prev) => [...prev, clean]);
      setNewSizeInput("");
    }
  };

  const handleRemoveSizeTag = (tag: string) => {
    setPackSizes((prev) => prev.filter((t) => t !== tag));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nameEn.trim()) newErrors.nameEn = t("ইংরেজি নাম আবশ্যক", "English name is required");
    if (!nameBn.trim()) newErrors.nameBn = t("বাংলা নাম আবশ্যক", "Bangla name is required");
    
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = t("সঠিক মূল্য দিন", "Provide a valid price");
    }

    const stockNum = parseInt(stock);
    if (!stock || isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = t("সঠিক স্টক পরিমাণ দিন", "Provide a valid stock count");
    }

    if (discountType !== "none") {
      const discValNum = parseFloat(discountValue);
      if (!discountValue || isNaN(discValNum) || discValNum <= 0) {
        newErrors.discountValue = t("সঠিক ছাড়ের পরিমাণ দিন", "Provide a valid discount value");
      } else if (discountType === "percent" && discValNum > 100) {
        newErrors.discountValue = t("শতকরা ছাড় ১০০% এর বেশি হতে পারে না", "Percentage cannot exceed 100%");
      } else if (discountType === "fixed" && discValNum >= priceNum) {
        newErrors.discountValue = t("ছাড় মূল্যের চেয়ে বেশি বা সমান হতে পারে না", "Discount cannot exceed product price");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);

    let finalImageUrl = image || "https://placehold.co/400x400?text=No+Image";

    if (newImageFile) {
      const formData = new FormData();
      formData.append("file", newImageFile);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await response.json();

        if (!response.ok || uploadData.error) {
          alert("Error uploading image: " + (uploadData.error || "Unknown error"));
          setIsSaving(false);
          return;
        }

        if (uploadData.url) {
          finalImageUrl = uploadData.url;
        }
      } catch (err: any) {
        alert("Error uploading image: " + err.message);
        setIsSaving(false);
        return;
      }
    }

    const priceNum = parseFloat(price);
    
    let finalDiscountPrice = null;
    let finalDiscountPercent = null;

    if (discountType === "percent") {
      finalDiscountPercent = parseFloat(discountValue);
      finalDiscountPrice = priceNum - (priceNum * (finalDiscountPercent / 100));
    } else if (discountType === "fixed") {
      const discountVal = parseFloat(discountValue);
      finalDiscountPrice = priceNum - discountVal;
      finalDiscountPercent = Math.round((discountVal / priceNum) * 100);
    }

    const unitStr = packSizes.length > 0 ? packSizes[0] : "১ টি";

    const { error } = await insforge.database.from("Products").update({
      name: nameEn,
      description: descriptionBn,
      price: priceNum,
      stock: parseInt(stock),
      image_url: finalImageUrl,
      category: category,
      discount_price: finalDiscountPrice,
      discount_percent: finalDiscountPercent,
      unit: unitStr
    }).eq("id", id as string);

    setIsSaving(false);
    if (!error) {
      router.push("/admin/products");
    } else {
      alert("Error updating product");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-primary font-bold">Loading product details...</div>;
  }

  return (
    <div className="bg-[#F3F4F6] min-h-screen overflow-x-hidden md:flex text-on-surface">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Form Canvas */}
      <main className="w-full flex-1 flex flex-col min-h-screen relative pb-20 md:pb-0">
        
        {/* Top Header desktop bar */}
        <header className="w-full h-16 bg-surface-container-lowest shadow-sm flex items-center px-margin-mobile md:px-margin-desktop sticky top-0 z-20 flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="mr-4 text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight font-bold font-tiro">
              {t("পণ্য সম্পাদনা", "Edit Product")}
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/products")}
              className="px-5 py-2 rounded-full border border-outline-variant text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all active:scale-95 shadow-sm cursor-pointer font-bold"
            >
              {t("বাতিল করুন", "Cancel")}
            </button>
            <button
              onClick={handleSave}
              className="bg-gradient-green text-on-primary px-6 py-2 rounded-full font-label-md text-label-md shadow-md hover:shadow-lg transition-all active:scale-[0.94] flex items-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {t("পণ্য সংরক্ষণ করুন", "Save Product")}
            </button>
          </div>
        </header>

        {/* Form Grid */}
        <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop pb-6 md:pb-12 mt-4">
          <div className="max-w-[1200px] mx-auto">
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: General Info & Pricing */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* General Information Card */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-5">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2 flex items-center gap-2 border-b border-outline-variant/20 pb-3 font-bold">
                    <span className="material-symbols-outlined text-primary">info</span>
                    {t("সাধারণ তথ্য", "General Information")}
                  </h2>

                  <div className="space-y-4">
                    {/* English Name */}
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                        {t("পণ্যের নাম (ইংরেজি) *", "Product Name (English) *")}
                      </label>
                      <input
                        type="text"
                        value={nameEn}
                        onChange={(e) => {
                          setNameEn(e.target.value);
                          if (errors.nameEn) setErrors((prev) => ({ ...prev, nameEn: "" }));
                        }}
                        className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md ${
                          errors.nameEn ? "border-error" : "border-outline-variant/60"
                        }`}
                        placeholder="e.g. Premium Miniket Rice"
                      />
                      {errors.nameEn && <p className="text-error text-xs font-semibold mt-1 ml-1">{errors.nameEn}</p>}
                    </div>

                    {/* Bangla Name */}
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                        {t("পণ্যের নাম (বাংলা) *", "Product Name (Bangla) *")}
                      </label>
                      <input
                        type="text"
                        value={nameBn}
                        onChange={(e) => {
                          setNameBn(e.target.value);
                          if (errors.nameBn) setErrors((prev) => ({ ...prev, nameBn: "" }));
                        }}
                        className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md ${
                          errors.nameBn ? "border-error" : "border-outline-variant/60"
                        }`}
                        placeholder="যেমন: প্রিমিয়াম মিনিকেট চাল"
                      />
                      {errors.nameBn && <p className="text-error text-xs font-semibold mt-1 ml-1">{errors.nameBn}</p>}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                        {t("পণ্যের বিবরণ", "Description")}
                      </label>
                      <textarea
                        value={descriptionBn}
                        onChange={(e) => setDescriptionBn(e.target.value)}
                        className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md resize-none h-24"
                        placeholder={t("পণ্যের বিস্তারিত বিবরণ...", "Detailed product description...")}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Category */}
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                          {t("ক্যাটাগরি *", "Category *")}
                        </label>
                        <div className="relative">
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-2.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md appearance-none pr-10 cursor-pointer"
                          >
                            <option value="grocery">{t("মুদি সামগ্রী (Grocery)", "Groceries")}</option>
                            <option value="vegetables">{t("তাজা সবজি (Fresh Vegetables)", "Vegetables")}</option>
                            <option value="fruits">{t("তাজা ফলমূল (Fresh Fruits)", "Fruits")}</option>
                            <option value="baby-care">{t("বেবি কেয়ার (Baby Care)", "Baby Care")}</option>
                            <option value="garments">{t("জামাকাপড় (Garments item)", "Garments item")}</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                            <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Toggle */}
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                          {t("অবস্থা", "Status")}
                        </label>
                        <div className="flex items-center gap-3 bg-surface border border-outline-variant/60 rounded-xl px-4 py-2 h-[41.5px]">
                          <span className="font-body-md text-on-surface flex-1">
                            {isActive ? t("সক্রিয় (Active)", "Active") : t("নিষ্ক্রিয় (Inactive)", "Inactive")}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isActive ? "bg-primary" : "bg-outline-variant/60"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isActive ? "translate-x-5" : "translate-x-0"
                              }`}
                            ></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Stock Card (Fixed Bangla Label mistakes) */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-5">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2 flex items-center gap-2 border-b border-outline-variant/20 pb-3 font-bold">
                    <span className="material-symbols-outlined text-primary">payments</span>
                    {t("মূল্য ও ইনভেন্টরি", "Pricing & Inventory")}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Price field */}
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                        {t("মূল্য (৳) *", "Price (৳) *")}
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => {
                          setPrice(e.target.value);
                          if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                        }}
                        className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md ${
                          errors.price ? "border-error" : "border-outline-variant/60"
                        }`}
                        placeholder="e.g. 350"
                      />
                      {errors.price && <p className="text-error text-xs font-semibold mt-1 ml-1">{errors.price}</p>}
                    </div>

                    {/* Stock quantity field (Fixed Label back to Stock Quantity) */}
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                        {t("স্টক পরিমাণ (Stock Quantity) *", "Stock Quantity *")}
                      </label>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => {
                          setStock(e.target.value);
                          if (errors.stock) setErrors((prev) => ({ ...prev, stock: "" }));
                        }}
                        className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md ${
                          errors.stock ? "border-error" : "border-outline-variant/60"
                        }`}
                        placeholder="e.g. 100"
                      />
                      {errors.stock && <p className="text-error text-xs font-semibold mt-1 ml-1">{errors.stock}</p>}
                    </div>
                  </div>
                </div>

                {/* Discounts Card (Fixed label mistake, toggle logic) */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-5">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2 flex items-center gap-2 border-b border-outline-variant/20 pb-3 font-bold">
                    <span className="material-symbols-outlined text-primary">loyalty</span>
                    {t("অফার ও ডিসকাউন্ট", "Discounts")}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    {/* Discount type toggle */}
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                        {t("ডিসকাউন্ট টাইপ", "Discount Type")}
                      </label>
                      <div className="flex bg-surface border border-outline-variant/60 rounded-xl p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountType("none");
                            setDiscountValue("");
                          }}
                          className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                            discountType === "none" ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container"
                          }`}
                        >
                          {t("কোনোটিই নয়", "None")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType("percent")}
                          className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                            discountType === "percent" ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container"
                          }`}
                        >
                          {t("শতকরা (%)", "Percentage")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType("fixed")}
                          className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                            discountType === "fixed" ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container"
                          }`}
                        >
                          {t("নির্দিষ্ট পরিমাণ (৳)", "Fixed BDT")}
                        </button>
                      </div>
                    </div>

                    {/* Discount Value field (Fixed Label to Value and dynamic prefix/suffix) */}
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                        {t("ছাড়ের পরিমাণ (Value)", "Discount Value")}
                      </label>
                      <div className="relative">
                        {discountType === "fixed" && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-sm">৳</span>
                        )}
                        <input
                          type="number"
                          disabled={discountType === "none"}
                          value={discountValue}
                          onChange={(e) => {
                            setDiscountValue(e.target.value);
                            if (errors.discountValue) setErrors((prev) => ({ ...prev, discountValue: "" }));
                          }}
                          className={`w-full bg-surface border rounded-xl py-2.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md ${
                            discountType === "fixed" ? "pl-7 pr-4" : "px-4"
                          } ${errors.discountValue ? "border-error" : "border-outline-variant/60"} ${
                            discountType === "none" ? "bg-surface-container opacity-60" : ""
                          }`}
                          placeholder={discountType === "none" ? t("ডিসকাউন্ট নিষ্ক্রিয়", "No discount active") : "e.g. 10"}
                        />
                        {discountType === "percent" && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-sm">%</span>
                        )}
                      </div>
                      {errors.discountValue && <p className="text-error text-xs font-semibold mt-1 ml-1">{errors.discountValue}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Image Upload & Pack sizes list */}
              <div className="flex flex-col gap-6">
                
                {/* Image Upload Area */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/20 pb-3 font-bold">
                    <span className="material-symbols-outlined text-primary">image</span>
                    {t("পণ্যের ছবি", "Product Image")}
                  </h2>

                  {/* Render Existing Image Preview if loaded */}
                  {image && (
                    <div className="mb-4 aspect-video rounded-xl overflow-hidden bg-surface-container relative border border-outline-variant/40">
                      <img className="w-full h-full object-cover" src={image} alt="Preview" />
                    </div>
                  )}

                  {/* Drag and Drop Box */}
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl bg-surface p-6 text-center hover:border-primary transition-colors cursor-pointer group min-h-[150px]">
                    <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                    </div>
                    <p className="font-body-md text-on-surface font-semibold mb-0.5">
                      {t("এখানে ছবি ড্র্যাগ করুন", "Drag and drop image here")}
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">
                      {t("SVG, PNG, JPG বা GIF (৬০০x৪০০ পিক্সেল)", "SVG, PNG, JPG or GIF (600x400 px)")}
                    </p>
                    <label className="px-4 py-1.5 rounded-full border border-primary text-primary hover:bg-primary/5 font-label-md text-label-md transition-all active:scale-95 cursor-pointer font-bold">
                      {t("ফাইল খুঁজুন", "Browse Files")}
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewImageFile(file);
                          setImage(URL.createObjectURL(file));
                        }
                      }} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Pack Sizes / Units Card (Fixed Variants replaced by Single Pack Sizes text tags) */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-3 font-bold">
                    <span className="material-symbols-outlined text-primary">shopping_basket</span>
                    {t("প্যাকেজ সাইজ / ইউনিট", "Pack Sizes / Units")}
                  </h2>

                  <div className="space-y-4">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant ml-1 leading-relaxed">
                      {t(
                        "পণ্যের জন্য উপলব্ধ সাইজ বা পরিমাপ যোগ করুন (যেমন: ৫০০ গ্রাম, ১ কেজি, ৫ কেজি)",
                        "Add flexible pack sizes or measurement tags for this grocery item."
                      )}
                    </label>

                    {/* Chips Display */}
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-surface rounded-xl border border-outline-variant/60">
                      {packSizes.length === 0 ? (
                        <span className="text-xs text-muted/70 italic p-1">
                          {t("কোনো প্যাকেজ যোগ করা হয়নি", "No pack sizes added yet")}
                        </span>
                      ) : (
                        packSizes.map((tag) => (
                          <div
                            key={tag}
                            className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-primary/20"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSizeTag(tag)}
                              className="text-on-primary-container hover:text-error transition-colors font-bold text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add tag inputs */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSizeInput}
                        onChange={(e) => setNewSizeInput(e.target.value)}
                        placeholder={t("যেমন: ২ কেজি", "e.g. 2 kg")}
                        className="flex-grow bg-surface border border-outline-variant rounded-xl px-4 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleAddSizeTag}
                        className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors cursor-pointer flex items-center justify-center shrink-0"
                      >
                        {t("যোগ করুন", "Add")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Bottom Action Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant/30 p-4 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
          <button
            onClick={() => router.push("/admin/products")}
            className="flex-1 py-3 rounded-full border border-outline-variant text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all active:scale-95 shadow-sm cursor-pointer font-bold"
          >
            {t("বাতিল করুন", "Cancel")}
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] bg-gradient-green text-on-primary py-3 rounded-full font-label-md text-label-md shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {t("পণ্য সংরক্ষণ করুন", "Save Product")}
          </button>
        </div>
      </main>
    </div>
  );
}
