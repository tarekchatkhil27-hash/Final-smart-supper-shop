"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { insforge } from "@/lib/insforge";
import { useApp } from "@/context/AppContext";

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { t } = useApp();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [status, setStatus] = useState("pending");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await insforge.database
        .from("Orders")
        .select("*")
        .eq("id", orderId)
        .single();
      
      if (error || !data) {
        alert("Order not found");
        router.push("/admin/orders");
        return;
      }

      setCustomerName(data.customer_name || "");
      setPhone(data.customer_phone || "");
      setAddress(data.customer_address || "");
      setDeliveryFee(Number(data.delivery_fee) || 0);
      setStatus(data.status || "pending");
      setIsLoading(false);
    };

    if (orderId) fetchOrder();
  }, [orderId, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await insforge.database
      .from("Orders")
      .update({
        customer_name: customerName,
        customer_phone: phone,
        phone: phone,
        customer_address: address,
        delivery_fee: deliveryFee,
        status: status
      })
      .eq("id", orderId);

    setIsSaving(false);

    if (error) {
      alert("Failed to update order: " + error.message);
    } else {
      router.push("/admin/orders");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#F3F4F6] min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 p-8 text-center">{t("লোড হচ্ছে...", "Loading...")}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#F3F4F6] min-h-screen flex w-full">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen relative w-full pb-16 md:pb-0">
        <header className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 bg-surface-container-lowest shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/orders")}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary font-bold">
              {t("অর্ডার সম্পাদনা", "Edit Order")}
            </h1>
          </div>
        </header>

        <main className="flex-1 p-margin-mobile md:p-margin-desktop mt-4">
          <form onSubmit={handleSave} className="max-w-[800px] space-y-6">
            
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-5">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2 border-b border-outline-variant/20 pb-3">
                {t("অর্ডারের তথ্য", "Order Details")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                    {t("গ্রাহকের নাম", "Customer Name")}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-2.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                    {t("মোবাইল নম্বর", "Mobile Number")}
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-2.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                    {t("ডেলিভারি ঠিকানা", "Delivery Address")}
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-2.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                    {t("ডেলিভারি ফি (৳)", "Delivery Fee (৳)")}
                  </label>
                  <input
                    type="number"
                    required
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-2.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">
                    {t("অবস্থা", "Status")}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-2.5 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="Pending Payment">Pending Payment</option>
                    <option value="Paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin/orders")}
                className="flex-1 bg-surface-container-high text-on-surface-variant px-6 py-3 rounded-full font-label-lg font-bold hover:bg-surface-variant transition-colors"
              >
                {t("বাতিল করুন", "Cancel")}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-gradient-green text-on-primary px-6 py-3 rounded-full font-label-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("সংরক্ষণ করুন", "Save Changes")}
              </button>
            </div>
            
          </form>
        </main>
      </div>
    </div>
  );
}
