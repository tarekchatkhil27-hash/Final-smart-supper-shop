"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useApp } from "@/context/AppContext";
import { insforge } from "@/lib/insforge";

export type HeroSlide = {
  image_url: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
};

const defaultSlides: HeroSlide[] = [
  { image_url: "", titleBn: "", titleEn: "", subtitleBn: "", subtitleEn: "" },
  { image_url: "", titleBn: "", titleEn: "", subtitleBn: "", subtitleEn: "" },
  { image_url: "", titleBn: "", titleEn: "", subtitleBn: "", subtitleEn: "" }
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const { t } = useApp();
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultSlides);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await insforge.database
        .from("Settings")
        .select("delivery_fee, hero_slides")
        .eq("id", 1)
        .single();
      
      if (data) {
        setDeliveryFee(data.delivery_fee?.toString() || "0");
        if (data.hero_slides && Array.isArray(data.hero_slides)) {
          // ensure exactly 3 slides
          const merged = [...defaultSlides];
          data.hero_slides.forEach((s: any, i: number) => {
            if (i < 3) merged[i] = { ...merged[i], ...s };
          });
          setHeroSlides(merged);
        }
      }
    };
    loadSettings();
  }, []);

  const handleSlideChange = (index: number, field: keyof HeroSlide, value: string) => {
    const newSlides = [...heroSlides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setHeroSlides(newSlides);
  };

  const handleImageUpload = async (index: number, file: File) => {
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("product-images")
      .uploadAuto(file);

    if (uploadError) {
      alert("Error uploading image: " + uploadError.message);
      return;
    }
    if (uploadData) {
      handleSlideChange(index, "image_url", uploadData.url);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    const feeNum = parseFloat(deliveryFee);
    if (isNaN(feeNum) || feeNum < 0) {
      setMessage("Please enter a valid delivery fee.");
      setIsSaving(false);
      return;
    }

    const { error } = await insforge.database
      .from("Settings")
      .update({ 
        delivery_fee: feeNum,
        hero_slides: heroSlides
      })
      .eq("id", 1);

    if (error) {
      setMessage("Error updating settings: " + error.message);
    } else {
      setMessage("Settings saved successfully!");
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen flex w-full">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen relative w-full pb-16 md:pb-0">
        <header className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 bg-surface-container-lowest shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary font-bold">
              {t("সেটিংস", "Settings")}
            </h1>
          </div>
        </header>

        <main className="flex-1 p-margin-mobile md:p-margin-desktop mt-4">
          <div className="max-w-[800px] space-y-6">
            <div>
              <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold font-tiro">
                {t("গ্লোবাল সেটিংস", "Global Settings")}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {t("আপনার স্টোরের জন্য গ্লোবাল সেটিংস কনফিগার করুন।", "Configure global settings for your store.")}
              </p>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-6">
              
              {/* Delivery Fee Section */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/20 pb-3 font-bold">
                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                  {t("ডেলিভারি ফি", "Delivery Fee")}
                </h2>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                    {t("ডেলিভারি ফি (৳)", "Delivery Fee (৳)")}
                  </label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-2.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md"
                    placeholder="e.g. 60"
                    required
                  />
                </div>
              </div>

              {/* Hero Slides Section */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30">
                <div className="flex flex-col mb-4 border-b border-outline-variant/20 pb-3">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 font-bold mb-1">
                    <span className="material-symbols-outlined text-primary">view_carousel</span>
                    {t("হোমপেজ হিরো স্লাইডার (৩টি স্লাইড)", "Homepage Hero Slider (3 Slides)")}
                  </h2>
                  <p className="text-sm text-on-surface-variant font-medium">
                    {t(
                      "* সেরা ফলাফলের জন্য ছবির সাইজ ১৬০০x৫০০ পিক্সেল (1600x500 px) ব্যবহার করুন।",
                      "* For best results, use images with a resolution of 1600x500 pixels."
                    )}
                  </p>
                </div>
                
                <div className="space-y-8">
                  {heroSlides.map((slide, i) => (
                    <div key={i} className="p-4 border border-outline-variant/30 rounded-xl bg-surface-container-lowest">
                      <h4 className="font-bold text-on-surface mb-4">{t(`স্লাইড ${i + 1}`, `Slide ${i + 1}`)}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                            {t("স্লাইড ছবি (Image)", "Slide Image")}
                          </label>
                          <div className="flex items-center gap-4">
                            {slide.image_url && (
                              <img src={slide.image_url} alt="slide" className="w-24 h-16 object-cover rounded-md border border-outline-variant" />
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleImageUpload(i, e.target.files[0]);
                                }
                              }} 
                              className="text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                            {t("টাইটেল (বাংলা)", "Title (Bangla)")}
                          </label>
                          <input
                            type="text"
                            value={slide.titleBn}
                            onChange={(e) => handleSlideChange(i, "titleBn", e.target.value)}
                            className="w-full bg-surface border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface"
                            placeholder="e.g. বাজার এখন ঘরে"
                          />
                        </div>
                        <div>
                          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                            {t("টাইটেল (English)", "Title (English)")}
                          </label>
                          <input
                            type="text"
                            value={slide.titleEn}
                            onChange={(e) => handleSlideChange(i, "titleEn", e.target.value)}
                            className="w-full bg-surface border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface"
                            placeholder="e.g. Grocery now at home"
                          />
                        </div>

                        <div>
                          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                            {t("সাব-টাইটেল (বাংলা)", "Subtitle (Bangla)")}
                          </label>
                          <input
                            type="text"
                            value={slide.subtitleBn}
                            onChange={(e) => handleSlideChange(i, "subtitleBn", e.target.value)}
                            className="w-full bg-surface border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface"
                          />
                        </div>
                        <div>
                          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                            {t("সাব-টাইটেল (English)", "Subtitle (English)")}
                          </label>
                          <input
                            type="text"
                            value={slide.subtitleEn}
                            onChange={(e) => handleSlideChange(i, "subtitleEn", e.target.value)}
                            className="w-full bg-surface border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {message && (
                <div className={`text-sm font-semibold p-3 rounded-xl ${message.includes("Error") || message.includes("valid") ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                  {message}
                </div>
              )}

              <div className="pt-2 pb-10">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-green text-on-primary px-8 py-3 rounded-full font-label-md text-label-md shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer font-bold disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {isSaving ? "Saving..." : t("সংরক্ষণ করুন", "Save Settings")}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
