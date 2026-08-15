"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useApp } from "@/context/AppContext";
import { insforge } from "@/lib/insforge";

export default function HomePage() {
  const { t, addToCart, language } = useApp();

  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);


  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: settingsData } = await insforge.database.from("Settings").select("hero_slides").eq("id", 1).single();
      if (settingsData && settingsData.hero_slides && settingsData.hero_slides.length > 0) {
        setHeroSlides(settingsData.hero_slides.filter((s: any) => s.image_url)); // Only valid slides
      } else {
        // Fallback default slides
        setHeroSlides([
          {
            image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600",
            titleBn: "বাজার এখন ঘরে",
            titleEn: "Grocery now at home",
            subtitleBn: "ফ্রেশ কোয়ালিটির বাজার পৌঁছে যাবে সরাসরি আপনার দরজায়। দ্রুত, নির্ভরযোগ্য এবং সাশ্রয়ী।",
            subtitleEn: "Fresh quality groceries delivered straight to your door. Fast, reliable, and affordable."
          }
        ]);
      }

      const { data } = await insforge.database.from("Products").select().limit(4);
      if (data) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          slug: p.id, // using id as slug for now
          nameBn: p.name,
          nameEn: p.name,
          price: p.price,
          image: p.image_url || "https://placehold.co/400x400?text=No+Image",
          unitBn: p.unit || "১ টি",
          unitEn: p.unit || "1 Pc",
          category: p.category || "grocery",
          discountPrice: p.discount_price || undefined,
          discountPercent: p.discount_percent || undefined,
          descriptionBn: p.description,
          descriptionEn: p.description,
        }));
        setFeaturedProducts(mapped);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* TopNavBar */}
      <Header />

      {/* Category Pills (Links to /shop with category parameters) */}
      <div className="w-full bg-surface-container-lowest py-3 px-margin-mobile md:px-margin-desktop overflow-x-auto whitespace-nowrap shadow-sm border-b border-surface-variant/40 hide-scrollbar flex gap-3">
        <Link
          href="/shop?cat=grocery"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-[#008C44] text-white rounded-full font-label-md text-label-md btn-press shadow-premium hover-lift cursor-pointer"
        >
          {t("মুদি বাজার", "Grocery Store")}
        </Link>
        <Link
          href="/shop?cat=fruits"
          className="inline-flex items-center px-4 py-2 bg-surface border border-outline-variant text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-container-high transition-colors btn-press shadow-soft hover-lift cursor-pointer"
        >
          {t("ফলমূল", "Fruits")}
        </Link>
        <Link
          href="/shop?cat=vegetables"
          className="inline-flex items-center px-4 py-2 bg-surface border border-outline-variant text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-container-high transition-colors btn-press shadow-soft hover-lift cursor-pointer"
        >
          {t("সবজি", "Vegetables")}
        </Link>
        <Link
          href="/shop?cat=baby-care"
          className="inline-flex items-center px-4 py-2 bg-surface border border-outline-variant text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-container-high transition-colors btn-press shadow-soft hover-lift cursor-pointer"
        >
          {t("বেবি কেয়ার", "Baby Care")}
        </Link>
        <Link
          href="/shop?cat=garments"
          className="inline-flex items-center px-4 py-2 bg-surface border border-outline-variant text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-container-high transition-colors btn-press shadow-soft hover-lift cursor-pointer"
        >
          {t("জামাকাপড়", "Garments item")}
        </Link>
      </div>

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-section-gap flex flex-col gap-8 md:gap-12 pb-24 md:pb-12">
        {/* Hero Banner */}
        <section className="relative w-full h-[350px] md:h-[500px] rounded-2xl overflow-hidden shadow-premium flex items-center bg-[#0f172a] hover-lift group">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-1000 ${
                index === currentHeroIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url('${slide.image_url}')` }}
            ></div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20"></div>
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentHeroIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {heroSlides[currentHeroIndex] && (
            <div className="relative z-10 p-8 md:p-12 max-w-lg transition-opacity duration-500">
              <h1 className="font-tiro text-3xl md:text-5xl text-white font-bold leading-tight mb-4 drop-shadow-md">
                {t(heroSlides[currentHeroIndex].titleBn || "বাজার এখন ঘরে", heroSlides[currentHeroIndex].titleEn || "Grocery now at home")}
              </h1>
              <p className="font-body-lg text-surface-container-low mb-6">
                {t(
                  heroSlides[currentHeroIndex].subtitleBn || "",
                  heroSlides[currentHeroIndex].subtitleEn || ""
                )}
              </p>
              <Link
                href="/shop"
                className="bg-gradient-green text-white font-headline-sm text-headline-sm px-6 py-3 rounded-full btn-press shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                {t("অর্ডার করুন", "Order Now")}{" "}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          )}
        </section>

        {/* Featured Products Grid */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
              {t("জনপ্রিয় পণ্য", "Popular Products")}
            </h2>
            <Link href="/shop" className="text-primary font-label-md text-label-md hover:underline">
              {t("সব দেখুন", "See All")}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => {
              const activePrice = product.discountPrice !== undefined ? product.discountPrice : product.price;
              const hasDiscount = product.discountPrice !== undefined;
              const formattedPrice = language === "bn" ? activePrice.toLocaleString("bn-BD") : activePrice;

              return (
                <div
                  key={product.id}
                  className="bg-surface-container-lowest rounded-2xl p-4 shadow-soft border border-surface-variant hover-lift flex flex-col h-full relative group"
                >
                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-gradient-orange text-white px-2 py-1 rounded font-micro text-micro font-bold z-10">
                      {language === "bn"
                        ? `${product.discountPercent?.toLocaleString("bn-BD")}% ছাড়`
                        : `${product.discountPercent}% OFF`}
                    </div>
                  )}
                  {/* New Badge */}
                  {product.isNew && !hasDiscount && (
                    <div className="absolute top-3 left-3 bg-gradient-green text-white px-2 py-1 rounded font-micro text-micro font-bold z-10">
                      {t("নতুন", "New")}
                    </div>
                  )}

                  {/* Image Container */}
                  <Link
                    href={`/product/${product.slug}`}
                    className="aspect-square w-full rounded-xl overflow-hidden bg-white mb-3 relative block"
                  >
                    <img
                      className="w-full !h-full object-cover card-zoom-image"
                      src={product.image}
                      alt={t(product.nameBn, product.nameEn)}
                    />
                  </Link>

                  {/* Product Title */}
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 line-clamp-2">
                    <Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">
                      {t(product.nameBn, product.nameEn)}
                    </Link>
                  </h3>

                  {/* Product Unit */}
                  <p className="font-label-sm text-label-sm text-muted mb-2">
                    {t(product.unitBn, product.unitEn)}
                  </p>

                  {/* Price & Add to Cart */}
                  <div className="mt-auto flex items-center justify-between">
                    <div className="font-headline-md text-headline-md text-primary">
                      ৳{formattedPrice}
                    </div>
                    <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product, 1);
                        }}
                        className="bg-gradient-to-br from-primary to-[#008C44] text-white w-8 h-8 rounded-full flex items-center justify-center btn-press shadow-soft hover-lift"
                        title={t("কার্টে যোগ করুন", "Add to Cart")}
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Shop by Category */}
        <section className="mt-4">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-6">
            {t("ক্যাটাগরি সমূহ", "Categories")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/shop?cat=grocery"
              className="relative h-32 md:h-48 rounded-2xl overflow-hidden group hover-lift shadow-sm cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBWJnEvyTbL--raIyz6vRHQKOTDjeMAulQByWimkcOFcEGVKmoYVq4KTwyu5mHTx7xb8Zt-pRnMpyhGjj9kQAR1SaeUoDniyNO5-dfTesvOdlmpDfC_jYWtw6QBw6MS9CMTuaQiqcw7u--BoE50_bxhPu0jrou1uKV3_ukkGd1c1ss4_gPo3rdT5Qh7gTZ9zniYf6i70zyPpaPAF96Nqt8Ro5_LLNdX1TzunUXRI5DtvZ-2-zGT_9-KzQ')",
                }}
              ></div>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-headline-md text-headline-md bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                  {t("মুদি বাজার", "Grocery Store")}
                </span>
              </div>
            </Link>

            <Link
              href="/shop?cat=fruits"
              className="relative h-32 md:h-48 rounded-2xl overflow-hidden group hover-lift shadow-sm cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCBe-srAdjDQguZQmbsrytKWXNqWepQqmH0RciTnySQQd9wARzrE4IKTcOsCUwY9wqaR221PPxjCtA2Nh646sizLXoAirGug46JzoTXvK_6j7oWTwQlvlrdjXIQ1RLrsGwaqZtF19lDNgrItbr5jeC6chUIzSLo0XxLpJ4AV79An7_dvxxVJOX9YvpEw6p-2JatCs4S-5D2AXyJn9P-w1k78k0J8GnYBC5Z1uSECyz9LJf_q5npZB-fEw')",
                }}
              ></div>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-headline-md text-headline-md bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                  {t("ফলমূল", "Fruits")}
                </span>
              </div>
            </Link>

            <Link
              href="/shop?cat=vegetables"
              className="relative h-32 md:h-48 rounded-2xl overflow-hidden group hover-lift shadow-sm cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCs_UuoOgrbCFEmRaAdAiib8bIbGn8B1s5bEKFLJGNUBCEvycljf_dafzbe_nC7OA99sRrPWGx1W2UkIl8TCB4Fx_VCjfxSwv9auBgl5svwR_2B14wr_JnuSMTXOZAetWc7wzCiWMDuDLcgg5qr4fVKu2URsDzwlinSJEirPcdemTvBqO2lTFjnSPLOlkmoxDjyaFua2NWGzNPag1tMdVB5ntjLNaZUUj54rn4VPqNsrcKD4AWoeHONyg')",
                }}
              ></div>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-headline-md text-headline-md bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                  {t("সবজি", "Vegetables")}
                </span>
              </div>
            </Link>

            <Link
              href="/shop?cat=baby-care"
              className="relative h-32 md:h-48 rounded-2xl overflow-hidden group hover-lift shadow-sm cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB5eEcnOcyxwdye57vqc5_BTU3QFi_YaR3mSXm6dWYvtcRm2AiYF5oaNnwszNLEddP8sOXRFBJgf6thzVV6m-L3n8e_MZo8RAWtWXSPWcg_V8N5aOFgYxJxbsnE_FopT246oApHSqQ5LLFfqlXCYRMHYzT7wjQBUqHBiGhLUrNohEaW3PnZ6wsdADbYrm8aUW3POJEZ-rnnl1Dr3QeahXWdJOW7OS4NhBZNhGzg6npUdSZ7SAPOnKQcaw')",
                }}
              ></div>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-headline-md text-headline-md bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                  {t("বেবি কেয়ার", "Baby Care")}
                </span>
              </div>
            </Link>

            <Link
              href="/shop?cat=garments"
              className="relative h-32 md:h-48 rounded-2xl overflow-hidden group hover-lift shadow-sm cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')",
                }}
              ></div>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-headline-md text-headline-md bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                  {t("জামাকাপড়", "Garments item")}
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="mt-4 mb-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant/40 p-6">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background text-center mb-6">
              {t("কেন আমাদের বেছে নেবেন?", "Why Choose Us?")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="trust-circle bg-green-50">
                  <i className="fas fa-shield-alt text-primary text-2xl"></i>
                </div>
                <div className="text-sm font-bold text-gray-800 mt-2">
                  {t("আসল পণ্য", "Genuine Product")}
                </div>
                <div className="text-gray-500 mt-1 text-xs">{t("১০০% নিশ্চিত", "100% Guaranteed")}</div>
              </div>
              <div className="text-center">
                <div className="trust-circle bg-orange-50">
                  <i className="fas fa-motorcycle text-orange-500 text-2xl"></i>
                </div>
                <div className="text-sm font-bold text-gray-800 mt-2">
                  {t("দ্রুত ডেলিভারি", "Fast Delivery")}
                </div>
                <div className="text-gray-500 mt-1 text-xs">{t("৩০–৬০ মিনিট", "30–60 Minutes")}</div>
              </div>
              <div className="text-center">
                <div className="trust-circle bg-blue-50">
                  <i className="fas fa-lock text-blue-500 text-2xl"></i>
                </div>
                <div className="text-sm font-bold text-gray-800 mt-2">
                  {t("নিরাপদ পেমেন্ট", "Secure Payment")}
                </div>
                <div className="text-gray-500 mt-1 text-xs">{t("SSL সুরক্ষিত", "SSL Secured")}</div>
              </div>
              <div className="text-center">
                <div className="trust-circle bg-red-50">
                  <i className="fas fa-undo text-red-400 text-2xl"></i>
                </div>
                <div className="text-sm font-bold text-gray-800 mt-2">
                  {t("সহজ রিটার্ন", "Easy Return")}
                </div>
                <div className="text-gray-500 mt-1 text-xs">{t("৭ দিনের মধ্যে", "Within 7 Days")}</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
