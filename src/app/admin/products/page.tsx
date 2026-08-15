"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useApp } from "@/context/AppContext";
import { Product } from "@/context/AppContext";
import { insforge } from "@/lib/insforge";

interface AdminProduct extends Product {
  stock?: number;
  isActive?: boolean;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { t, language } = useApp();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    // Auth guard is handled by layout, but we fetch from insforge now
    const fetchProducts = async () => {
      const { data } = await insforge.database.from("Products").select().order('created_at', { ascending: false });
      if (data) {
        const mapped: AdminProduct[] = data.map((p: any) => ({
          id: p.id,
          slug: p.id,
          nameBn: p.name,
          nameEn: p.name,
          price: p.price,
          image: p.image_url || "https://placehold.co/400x400?text=No+Image",
          unitBn: "১ টি",
          unitEn: "1 Pc",
          category: "general",
          descriptionBn: p.description,
          descriptionEn: p.description,
          stock: p.stock || 0,
          isActive: true
        }));
        setProducts(mapped);
      }
    };
    fetchProducts();
  }, [router]);

  const handleDelete = async (id: string) => {
    const confirmMsg = language === "bn"
      ? "আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?"
      : "Are you sure you want to delete this product?";
    
    if (confirm(confirmMsg)) {
      const { error } = await insforge.database.from("Products").delete().eq("id", id);
      if (!error) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert("Error deleting product");
      }
    }
  };

  const toggleActiveStatus = async (id: string) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          isActive: !p.isActive,
        };
      }
      return p;
    });
    setProducts(updated);
  };

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    const nameBnMatch = product.nameBn.includes(searchTerm);
    const nameEnMatch = product.nameEn.toLowerCase().includes(term);
    const categorySearchMatch = product.category.toLowerCase().includes(term);
    
    const searchPassed = nameBnMatch || nameEnMatch || categorySearchMatch;
    const categoryPassed = filterCategory === "all" || product.category === filterCategory;
    
    return searchPassed && categoryPassed;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice ?? a.price;
    const priceB = b.discountPrice ?? b.price;

    if (sortBy === "price-high") return priceB - priceA;
    if (sortBy === "price-low") return priceA - priceB;
    if (sortBy === "stock-low") return (a.stock || 0) - (b.stock || 0);
    if (sortBy === "oldest") return parseInt(a.id) - parseInt(b.id);
    return parseInt(b.id) - parseInt(a.id); // Default newest
  });

  // Language display helper
  const f = (num: number) => (language === "bn" ? num.toLocaleString("bn-BD") : num);

  return (
    <div className="bg-[#F3F4F6] min-h-screen flex w-full">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Admin Area */}
      <div className="md:ml-0 flex-1 flex flex-col h-full w-full relative z-10 pb-16 md:pb-0">
        
        {/* TopNavBar */}
        <header className="bg-surface-container-lowest shadow-sm flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary font-bold tracking-tight">
              {t("ড্যাশবোর্ড", "Dashboard")}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 hover:bg-surface-container transition-colors p-1 md:pr-3 rounded-full">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                A
              </span>
              <span className="font-headline-sm text-headline-sm text-primary hidden md:block">
                {t("এডমিন প্রোফাইল", "Admin Profile")}
              </span>
            </div>
          </div>
        </header>

        {/* Main Product Catalog Canvas */}
        <main className="flex-1 bg-surface p-margin-mobile md:p-margin-desktop mt-4">
          
          {/* Page Header Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold font-tiro">
                {t("পণ্য তালিকা", "Product Catalog")}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {t(
                  "আপনার ইনভেন্টরি, মূল্য এবং পণ্যের দৃশ্যমানতা পরিচালনা করুন।",
                  "Manage your inventory, pricing, and product visibility."
                )}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {/* Controls Wrapper */}
              <div className="flex flex-col sm:flex-row gap-2 flex-1 md:w-auto">
                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="all">{t("সব ক্যাটাগরি", "All Categories")}</option>
                  <option value="grocery">{t("মুদি বাজার", "Grocery")}</option>
                  <option value="fruits">{t("ফলমূল", "Fruits")}</option>
                  <option value="vegetables">{t("সবজি", "Vegetables")}</option>
                  <option value="baby-care">{t("বেবি কেয়ার", "Baby Care")}</option>
                  <option value="garments">{t("জামাকাপড়", "Garments item")}</option>
                </select>

                {/* Sort Option */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="newest">{t("নতুন প্রোডাক্ট", "Newest")}</option>
                  <option value="oldest">{t("পুরাতন প্রোডাক্ট", "Oldest")}</option>
                  <option value="price-high">{t("বেশি মূল্য", "Price High to Low")}</option>
                  <option value="price-low">{t("কম মূল্য", "Price Low to High")}</option>
                  <option value="stock-low">{t("কম স্টক", "Low Stock")}</option>
                </select>

                {/* Filter search box */}
                <div className="flex items-center bg-surface-container-lowest border border-outline-variant/60 rounded-lg px-3 py-2 shadow-sm focus-within:border-primary transition-colors flex-1 min-w-[200px]">
                  <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[18px]">search</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("পণ্য খুঁজুন...", "Search products...")}
                    className="bg-transparent border-none outline-none w-full font-body-md text-body-md text-on-surface placeholder-on-surface-variant focus:ring-0 p-0"
                  />
                </div>
              </div>
              
              {/* Add Product Button */}
              <Link
                href="/admin/products/new"
                className="shrink-0 flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-headline-sm text-headline-sm text-on-primary shadow-sm hover:shadow-md transition-all scale-95 active:scale-90 bg-gradient-green cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined text-sm font-bold">add</span>
                <span>{t("নতুন পণ্য যোগ করুন", "Add New Product")}</span>
              </Link>
            </div>
          </div>

          {/* Data Table Container */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
            
            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-surface-container-low border-b border-outline-variant/50">
                  <tr className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="px-6 py-4 w-16">{t("ছবি", "Image")}</th>
                    <th className="px-6 py-4">{t("পণ্যের নাম", "Product Name")}</th>
                    <th className="px-6 py-4 w-28">{t("মূল্য", "Price")}</th>
                    <th className="px-6 py-4 w-32">{t("ক্যাটাগরি", "Category")}</th>
                    <th className="px-6 py-4 w-24 text-right">{t("স্টক", "Stock")}</th>
                    <th className="px-6 py-4 w-32 text-center">{t("অবস্থা", "Status")}</th>
                    <th className="px-6 py-4 w-28 text-right">{t("অ্যাকশন", "Actions")}</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-sm">
                    {sortedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-on-surface-variant font-medium">
                          {t("কোনো পণ্য পাওয়া যায়নি", "No products found")}
                        </td>
                      </tr>
                    ) : (
                      sortedProducts.map((product) => {
                      const activePrice = product.discountPrice ?? product.price;
                      const isOutOfStock = product.stock === 0;

                      return (
                        <tr
                          key={product.id}
                          className={`hover:bg-surface-container transition-colors group ${
                            !product.isActive || isOutOfStock ? "bg-surface-container-lowest/50 opacity-75" : ""
                          }`}
                        >
                          {/* Image */}
                          <td className="px-6 py-3">
                            <img
                              className={`w-12 h-12 rounded-lg object-cover border border-outline-variant/40 bg-surface shrink-0 ${
                                isOutOfStock ? "grayscale-[0.3]" : ""
                              }`}
                              src={product.image}
                              alt={product.nameEn}
                            />
                          </td>

                          {/* Name / SKU info */}
                          <td className="px-6 py-3">
                            <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                              {t(product.nameBn, product.nameEn)}
                            </p>
                            <p className={`font-micro text-micro mt-0.5 ${isOutOfStock ? "text-error font-semibold" : "text-on-surface-variant"}`}>
                              {isOutOfStock ? t("স্টকআউট (Out of Stock)", "Out of Stock") : `SKU: SSS-PRO-${100 + parseInt(product.id)}`}
                            </p>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-3 font-body-md text-body-md text-on-surface font-bold">
                            ৳{f(activePrice)}
                          </td>

                          {/* Category Badge */}
                          <td className="px-6 py-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full font-label-md text-label-md bg-surface-container text-on-surface-variant border border-outline-variant/30 font-medium capitalize">
                              {product.category === "grocery" && t("মুদি বাজার", "Grocery")}
                              {product.category === "fruits" && t("ফলমূল", "Fruits")}
                              {product.category === "vegetables" && t("সবজি", "Vegetables")}
                              {product.category === "baby-care" && t("বেবি কেয়ার", "Baby Care")}
                              {product.category === "garments" && t("জামাকাপড়", "Garments item")}
                            </span>
                          </td>

                          {/* Stock amount */}
                          <td className={`px-6 py-3 font-body-md text-body-md text-right font-bold ${isOutOfStock ? "text-error" : "text-on-surface"}`}>
                            {f(product.stock || 0)}
                          </td>

                          {/* Active / Inactive Switch */}
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => toggleActiveStatus(product.id)}
                              aria-checked={product.isActive}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${
                                product.isActive ? "bg-primary" : "bg-outline-variant/60"
                              }`}
                              role="switch"
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  product.isActive ? "translate-x-6" : "translate-x-1"
                                }`}
                              ></span>
                            </button>
                          </td>

                          {/* Edit / Delete actions */}
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-primary-container hover:text-primary transition-colors cursor-pointer"
                                title={t("সম্পাদনা", "Edit")}
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </Link>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors cursor-pointer"
                                title={t("মুছে ফেলুন", "Delete")}
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

              {/* Mobile Card List View */}
              <div className="md:hidden flex flex-col gap-3 p-4">
                {sortedProducts.length === 0 ? (
                  <div className="text-center py-6 text-on-surface-variant font-medium">
                    {t("কোনো পণ্য পাওয়া যায়নি", "No products found")}
                  </div>
                ) : (
                  sortedProducts.map((product) => {
                  const activePrice = product.discountPrice ?? product.price;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <div
                      key={product.id}
                      className={`p-4 flex gap-4 hover:bg-surface-container transition-colors ${
                        !product.isActive || isOutOfStock ? "bg-surface-container-lowest/50 opacity-75" : ""
                      }`}
                    >
                      <img
                        className={`w-16 h-16 rounded-lg object-cover border border-outline-variant/40 bg-surface shrink-0 ${
                          isOutOfStock ? "grayscale-[0.3]" : ""
                        }`}
                        src={product.image}
                        alt={product.nameEn}
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">
                              {t(product.nameBn, product.nameEn)}
                            </p>
                            <p className={`font-micro text-micro mt-0.5 ${isOutOfStock ? "text-error font-semibold" : "text-on-surface-variant"}`}>
                              {isOutOfStock ? t("স্টকআউট", "Out of Stock") : `SKU: SSS-PRO-${100 + parseInt(product.id)}`}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link href={`/admin/products/${product.id}/edit`} className="text-on-surface-variant hover:text-primary">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </Link>
                            <button onClick={() => handleDelete(product.id)} className="text-on-surface-variant hover:text-error cursor-pointer">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="font-body-md text-body-md text-on-surface font-bold">
                            ৳{f(activePrice)}
                          </span>
                          
                          {/* Active Toggle Switch */}
                          <button
                            onClick={() => toggleActiveStatus(product.id)}
                            aria-checked={product.isActive}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${
                              product.isActive ? "bg-primary" : "bg-outline-variant/60"
                            }`}
                            role="switch"
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                product.isActive ? "translate-x-6" : "translate-x-1"
                              }`}
                            ></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination / Table summary Footer */}
            <div className="bg-surface-container-lowest border-t border-outline-variant/30 px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="font-body-md text-body-md text-on-surface-variant text-center md:text-left">
                {language === "bn"
                  ? `মোট ${f(filteredProducts.length)}টি পণ্য তালিকাভুক্ত করা হয়েছে`
                  : `Showing ${filteredProducts.length} of ${products.length} products`}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
