"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useApp } from "@/context/AppContext";

export default function ContactPage() {
  const { t } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const contact = formData.get("contact") as string;
    const message = formData.get("message") as string;
    
    // Google Form submission URL
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSezu-XJ5do_Tdu5VrZWJrf8oqIahFufxW_dm15bSdZ5xM_ORQ/formResponse";
    
    // Append data using Google's specific entry IDs
    const submitData = new URLSearchParams();
    submitData.append("entry.842048920", name);
    submitData.append("entry.32004522", contact);
    submitData.append("entry.2052994748", message);
    
    try {
      await fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: submitData.toString()
      });

      // With no-cors we can't read the response, but if it didn't throw a network error, it succeeded
      alert(t("আপনার বার্তা সফলভাবে পাঠানো হয়েছে!", "Your message has been sent successfully!"));
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      alert(t("বার্তা পাঠাতে সমস্যা হয়েছে।", "There was an error sending your message."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col antialiased">
      <Header />
      
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-20">
        
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-4xl md:text-5xl font-bold text-[#003366] mb-4 tracking-tight font-tiro">
            {t("যোগাযোগ করুন", "Contact Us")}
          </h1>
          <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto">
            {t("যেকোনো প্রশ্ন, পরামর্শ বা সাহায্যের জন্য আমাদের সাথে যোগাযোগ করুন। আমরা আপনার সেবায় সর্বদা প্রস্তুত।", "For any questions, suggestions, or assistance, please contact us. We are always ready to serve you.")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Contact Information Cards */}
          <div className="flex flex-col gap-6">
            
            {/* Address Card */}
            <div className="group bg-surface-container-lowest rounded-3xl p-6 md:p-8 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-6 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[120px] text-primary">storefront</span>
              </div>
              <div className="w-14 h-14 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-[28px]">location_on</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-2">{t("আমাদের ঠিকানা", "Our Address")}</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  ইয়াছিন হাজির বাজার, চাটখিল, নোয়াখালী।<br/>
                  Yasin Hajir Bazar, Chatkhil, Noakhali.
                </p>
              </div>
            </div>

            {/* Phone Card */}
            <div className="group bg-surface-container-lowest rounded-3xl p-6 md:p-8 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-6 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[120px] text-green-600">call</span>
              </div>
              <div className="w-14 h-14 shrink-0 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center border border-green-500/20">
                <span className="material-symbols-outlined text-[28px]">phone_in_talk</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-2">{t("ফোন নম্বর", "Phone Number")}</h3>
                <p className="text-on-surface-variant leading-relaxed mb-1 font-semibold text-green-700">
                  <a href="tel:+8801629011446" className="hover:underline hover:text-green-800 transition-colors">০১৬২৯ ০১১৪৪৬</a>
                </p>
                <p className="text-sm text-muted">
                  {t("সকাল ৯টা থেকে রাত ৯টা পর্যন্ত", "Available 9 AM to 9 PM")}
                </p>
              </div>
            </div>

            {/* Email Card */}
            <div className="group bg-surface-container-lowest rounded-3xl p-6 md:p-8 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-6 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[120px] text-blue-600">mail</span>
              </div>
              <div className="w-14 h-14 shrink-0 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
                <span className="material-symbols-outlined text-[28px]">mail</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-2">{t("ইমেইল", "Email")}</h3>
                <p className="text-on-surface-variant leading-relaxed font-semibold text-blue-700">
                  smartsuppershop@gmail.com
                </p>
                <p className="text-sm text-muted">
                  {t("যেকোনো সময় আমাদের ইমেইল করতে পারেন", "Email us anytime")}
                </p>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="group bg-surface-container-lowest rounded-3xl p-6 md:p-8 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-6 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fab fa-whatsapp text-[120px] text-[#25D366]"></i>
              </div>
              <div className="w-14 h-14 shrink-0 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center border border-[#25D366]/20">
                <i className="fab fa-whatsapp text-[28px]"></i>
              </div>
              <div>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-2">WhatsApp</h3>
                <p className="text-on-surface-variant leading-relaxed font-semibold text-[#25D366]">
                  <a href="https://wa.me/8801629011446" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#1da851] transition-colors">
                    +8801629011446
                  </a>
                </p>
                <p className="text-sm text-muted">
                  {t("মেসেজ দিন যেকোনো মুহূর্তে", "Message us anytime")}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-outline-variant/20 relative">
            
            {/* Form Decorative blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full rounded-tr-[2.5rem] -z-10"></div>

            <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-6">{t("আমাদের একটি বার্তা পাঠান", "Send us a Message")}</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2 ml-1">
                  {t("আপনার নাম", "Your Name")}
                </label>
                <input 
                  name="name"
                  type="text" 
                  required
                  placeholder={t("নাম লিখুন", "Enter your name")}
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-5 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2 ml-1">
                  {t("ইমেইল বা ফোন নম্বর", "Email or Phone")}
                </label>
                <input 
                  name="contact"
                  type="text" 
                  required
                  placeholder={t("ইমেইল বা ফোন", "Enter email or phone")}
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-5 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2 ml-1">
                  {t("আপনার বার্তা", "Your Message")}
                </label>
                <textarea 
                  name="message"
                  required
                  rows={4}
                  placeholder={t("এখানে আপনার বার্তা লিখুন...", "Write your message here...")}
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-5 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-bold text-lg rounded-xl py-4 mt-2 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 btn-press disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                ) : (
                  <>
                    {t("বার্তা পাঠান", "Send Message")}
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </>
                )}
              </button>

            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
