"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useApp } from "@/context/AppContext";
import { Product } from "@/context/AppContext";
import { insforge } from "@/lib/insforge";

function ShopContent() {
  const { t, addToCart, language } = useApp();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat") || "all";

  // Filter States
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [selectedCategories, setSelectedCategories] = useState({
    all: true,
    grocery: false,
    fruits: false,
    vegetables: false,
    "baby-care": false,
    garments: false,
  });
  const [sortBy, setSortBy] = useState<string>("popular");

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await insforge.database.from("Products").select();
      if (data) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          slug: p.id,
          nameBn: p.name,
          nameEn: p.name,
          price: p.price,
          image: p.image_url || "https://placehold.co/400x400?text=No+Image",
          unitBn: p.unit || "১ টি",
          unitEn: p.unit || "1 Pc",
          category: p.category || "grocery",
          descriptionBn: p.description,
          descriptionEn: p.description,
          discountPrice: p.discount_price || undefined,
          discountPercent: p.discount_percent || undefined,
        }));
        setAllProducts(mapped);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Sync with URL query parameter on mount / change
  useEffect(() => {
    if (catParam && catParam !== "all") {
      setSelectedCategories({
        all: false,
        grocery: catParam === "grocery",
        fruits: catParam === "fruits",
        vegetables: catParam === "vegetables",
        "baby-care": catParam === "baby-care",
        garments: catParam === "garments",
      });
    } else {
      setSelectedCategories({
        all: true,
        grocery: false,
        fruits: false,
        vegetables: false,
        "baby-care": false,
        garments: false,
      });
    }
  }, [catParam]);

  const handleCategoryCheckboxChange = (cat: keyof typeof selectedCategories) => {
    setSelectedCategories((prev) => {
      // Calculate how many checkboxes are currently checked
      const checkedCount = Object.values(prev).filter(Boolean).length;

      // If user tries to uncheck the last checked box, do not allow it
      if (prev[cat] && checkedCount === 1) {
        return prev;
      }

      const next = { ...prev };

      if (cat === "all") {
        if (!prev.all) {
          return {
            all: true,
            grocery: false,
            fruits: false,
            vegetables: false,
            "baby-care": false,
            garments: false,
          };
        } else {
          // Prevent unchecking "all" if it's the only one checked
          return prev;
        }
      } else {
        // Toggling a specific category
        const newValue = !prev[cat];
        next[cat] = newValue;

        if (newValue) {
          // If checking a specific category, de-select "all"
          next.all = false;
        } else {
          // If unchecking a specific category, verify at least one is still checked
          const anyChecked = Object.entries(next)
            .filter(([k, _]) => k !== "all")
            .some(([_, v]) => v);
          if (!anyChecked) {
            // If nothing else is checked, automatically check "all"
            next.all = true;
          }
        }
      }

      return next;
    });
  };

  const handleSeeAll = (filterKeys: string[]) => {
    setSelectedCategories(() => {
      return {
        all: false,
        grocery: filterKeys.includes("grocery"),
        fruits: filterKeys.includes("fruits"),
        vegetables: filterKeys.includes("vegetables"),
        "baby-care": filterKeys.includes("baby-care"),
        garments: filterKeys.includes("garments"),
      };
    });
  };

  // Filter & Sort Logic
  const filteredProducts = allProducts.filter((product) => {
    // Price check
    const activePrice = product.discountPrice !== undefined ? product.discountPrice : product.price;
    if (activePrice > maxPrice) return false;

    // Category check
    if (selectedCategories.all) return true;

    const isCategoryChecked = selectedCategories[product.category as keyof typeof selectedCategories];
    return isCategoryChecked;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPrice = a.discountPrice !== undefined ? a.discountPrice : a.price;
    const bPrice = b.discountPrice !== undefined ? b.discountPrice : b.price;

    if (sortBy === "price-low") {
      return aPrice - bPrice;
    }
    if (sortBy === "price-high") {
      return bPrice - aPrice;
    }
    if (sortBy === "newest") {
      const aNew = a.isNew ? 1 : 0;
      const bNew = b.isNew ? 1 : 0;
      return bNew - aNew;
    }
    // "popular" / default
    return parseInt(a.id) - parseInt(b.id);
  });

  // Group products by custom sections: "মুদি বাজার", "সবজি ও ফলমূল", "বেবি কেয়ার", "জামাকাপড়"
  const groupedProducts: Record<
    string,
    { titleBn: string; titleEn: string; items: Product[]; filterKeys: string[] }
  > = {
    grocery: { titleBn: "মুদি বাজার", titleEn: "Grocery Store", items: [], filterKeys: ["grocery"] },
    "fruits-veg": {
      titleBn: "সবজি ও ফলমূল",
      titleEn: "Vegetables & Fruits",
      items: [],
      filterKeys: ["fruits", "vegetables"],
    },
    "baby-care": { titleBn: "বেবি কেয়ার", titleEn: "Baby Care", items: [], filterKeys: ["baby-care"] },
    garments: { titleBn: "জামাকাপড়", titleEn: "Garments item", items: [], filterKeys: ["garments"] },
  };

  sortedProducts.forEach((product) => {
    if (product.category === "grocery") {
      groupedProducts.grocery.items.push(product);
    } else if (product.category === "fruits" || product.category === "vegetables") {
      groupedProducts["fruits-veg"].items.push(product);
    } else if (product.category === "baby-care") {
      groupedProducts["baby-care"].items.push(product);
    } else if (product.category === "garments") {
      groupedProducts.garments.items.push(product);
    }
  });

  const activeGroups = Object.entries(groupedProducts).filter(
    ([_, group]) => group.items.length > 0
  );

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* TopNavBar */}
      <Header />

      {/* Main Content Area */}
      {loading ? (
        <div className="flex-grow flex justify-center items-center font-bold text-primary py-24">
          Loading products...
        </div>
      ) : (
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-section-gap flex flex-col md:flex-row gap-6 mt-4 mb-16 md:mb-0">
        {/* Sidebar Filters */}
        <aside className="hidden md:block w-64 flex-shrink-0 bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-variant/40 self-start sticky top-24">
          <h2 className="font-headline-sm text-headline-sm text-on-background mb-4 pb-2 border-b border-surface-variant">
            {t("ফিল্টার করুন", "Filter Products")}
          </h2>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="font-label-md text-label-md text-on-surface font-bold mb-3">
              {t("মূল্য পরিসীমা", "Price Range")}
            </h3>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-primary h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-body-md text-on-surface-variant mt-2 font-semibold">
              <span>৳ ০</span>
              <span className="text-primary">
                ৳ {language === "bn" ? maxPrice.toLocaleString("bn-BD") : maxPrice}
              </span>
              <span>৳ ১,০০০</span>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-label-md text-label-md text-on-surface font-bold mb-3">
              {t("ক্যাটাগরি", "Category")}
            </h3>
            <div className="space-y-3">
              {/* ALL checkbox */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.all}
                  onChange={() => handleCategoryCheckboxChange("all")}
                  className="form-checkbox text-primary rounded border-outline-variant focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-primary transition-colors font-bold">
                  {t("সব পণ্য (All)", "All Products")}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.grocery}
                  onChange={() => handleCategoryCheckboxChange("grocery")}
                  className="form-checkbox text-primary rounded border-outline-variant focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-primary transition-colors">
                  {t("মুদি বাজার", "Grocery Store")}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.fruits}
                  onChange={() => handleCategoryCheckboxChange("fruits")}
                  className="form-checkbox text-primary rounded border-outline-variant focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-primary transition-colors">
                  {t("ফলমূল", "Fruits")}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.vegetables}
                  onChange={() => handleCategoryCheckboxChange("vegetables")}
                  className="form-checkbox text-primary rounded border-outline-variant focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-primary transition-colors">
                  {t("তাজা সবজি", "Fresh Vegetables")}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories["baby-care"]}
                  onChange={() => handleCategoryCheckboxChange("baby-care")}
                  className="form-checkbox text-primary rounded border-outline-variant focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-primary transition-colors">
                  {t("বেবি কেয়ার", "Baby Care")}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.garments}
                  onChange={() => handleCategoryCheckboxChange("garments")}
                  className="form-checkbox text-primary rounded border-outline-variant focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-primary transition-colors">
                  {t("জামাকাপড়", "Garments item")}
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-grow w-full">
          {/* Top Filter Summary Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-surface-container-lowest p-3 md:p-4 rounded-xl shadow-sm border border-surface-variant mb-6 gap-4">
            <p className="font-body-md text-body-md text-on-surface-variant font-semibold">
              {language === "bn"
                ? `${filteredProducts.length.toLocaleString("bn-BD")}টি পণ্য পাওয়া গেছে`
                : `${filteredProducts.length} products found`}
            </p>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="font-label-md text-label-md text-on-surface whitespace-nowrap" htmlFor="sort">
                {t("সাজান:", "Sort by:")}
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select w-full sm:w-auto font-body-md text-body-md text-on-surface bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring focus:ring-primary/20 py-1.5 pl-3 pr-8"
              >
                <option value="popular">{t("সবচেয়ে জনপ্রিয়", "Most Popular")}</option>
                <option value="newest">{t("নতুন পণ্য", "Newest")}</option>
                <option value="price-low">{t("মূল্য: কম থেকে বেশি", "Price: Low to High")}</option>
                <option value="price-high">{t("মূল্য: বেশি থেকে কম", "Price: High to Low")}</option>
              </select>
            </div>
          </div>

          {/* Grouped Product Grid Sections */}
          <div className="space-y-10">
            {activeGroups.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-surface-variant/40 shadow-sm">
                <span className="material-symbols-outlined text-[48px] text-muted mb-2">search_off</span>
                <p className="text-on-surface-variant font-bold">
                  {t("কোনো পণ্য খুঁজে পাওয়া যায়নি!", "No products match the selected filters.")}
                </p>
              </div>
            ) : (
              activeGroups.map(([groupKey, group]) => (
                <section key={groupKey} className="border-b border-surface-variant/30 pb-8 last:border-0">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-headline-sm text-headline-sm text-on-background font-bold border-l-4 border-primary pl-3">
                      {t(group.titleBn, group.titleEn)}
                    </h2>
                    {/* See All (সব দেখুন) for this section */}
                    <button
                      onClick={() => handleSeeAll(group.filterKeys)}
                      className="text-primary font-label-md text-label-md hover:underline cursor-pointer btn-press font-semibold"
                    >
                      {t("সব দেখুন", "See All")}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                    {(selectedCategories.all ? group.items.slice(0, 3) : group.items).map((product) => {
                      const activePrice = product.discountPrice !== undefined ? product.discountPrice : product.price;
                      const hasDiscount = product.discountPrice !== undefined;
                      const formattedPrice = language === "bn" ? activePrice.toLocaleString("bn-BD") : activePrice;

                      return (
                        <div
                          key={product.id}
                          className="bg-surface-container-lowest rounded-2xl shadow-soft border border-surface-variant overflow-hidden group hover-lift flex flex-col h-full relative"
                        >
                          {/* Discount tag */}
                          {hasDiscount && (
                            <div className="absolute top-2 left-2 z-10 bg-gradient-orange text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                              {language === "bn"
                                ? `-${product.discountPercent?.toLocaleString("bn-BD")}%`
                                : `-${product.discountPercent}%`}
                            </div>
                          )}

                          {/* Image */}
                          <Link
                            href={`/product/${product.slug}`}
                            className="aspect-square bg-white overflow-hidden block relative"
                          >
                            <img
                              className="w-full !h-full object-cover card-zoom-image"
                              src={product.image}
                              alt={t(product.nameBn, product.nameEn)}
                            />
                          </Link>

                          {/* Details */}
                          <div className="p-3.5 flex flex-col flex-grow">
                            <h3 className="font-label-md text-label-md text-on-surface mb-1 hover:text-primary transition-colors line-clamp-1">
                              <Link href={`/product/${product.slug}`}>{t(product.nameBn, product.nameEn)}</Link>
                            </h3>
                            <p className="text-xs text-muted mb-3">{t(product.unitBn, product.unitEn)}</p>
                            <div className="mt-auto flex justify-between items-center">
                              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                                ৳ {formattedPrice}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  addToCart(product, 1);
                                }}
                                className="bg-gradient-to-br from-primary to-[#008C44] text-white w-8 h-8 rounded-full flex items-center justify-center btn-press shadow-soft hover-lift cursor-pointer"
                                title={t("কার্টে যোগ করুন", "Add to Cart")}
                              >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </main>
      )}

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-surface border-t border-surface-variant/40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-xl md:hidden">
        <Link
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high scale-94 transition-all duration-150 rounded-2xl px-3 py-1"
          href="/"
        >
          <span className="material-symbols-outlined mb-1" data-icon="home">
            home
          </span>
          <span className="font-label-sm text-label-sm">{t("হোম", "Home")}</span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container scale-94 transition-all duration-150 rounded-2xl px-3 py-1"
          href="/shop"
        >
          <span className="material-symbols-outlined mb-1" data-icon="local_grocery_store">
            local_grocery_store
          </span>
          <span className="font-label-sm text-label-sm font-bold">{t("শপ", "Shop")}</span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high scale-94 transition-all duration-150 rounded-2xl px-3 py-1"
          href="/shop?cat=fruits"
        >
          <span className="material-symbols-outlined mb-1" data-icon="nutrition">
            nutrition
          </span>
          <span className="font-label-sm text-label-sm">{t("ফলমূল", "Fruits")}</span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high scale-94 transition-all duration-150 rounded-2xl px-3 py-1"
          href="/cart"
        >
          <span className="material-symbols-outlined mb-1" data-icon="shopping_cart">
            shopping_cart
          </span>
          <span className="font-label-sm text-label-sm">{t("কার্ট", "Cart")}</span>
        </Link>
      </nav>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-primary font-bold">Loading shop catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
