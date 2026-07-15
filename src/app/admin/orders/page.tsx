"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useApp } from "@/context/AppContext";

interface OrderItem {
  productId: string;
  nameBn: string;
  nameEn: string;
  price: number;
  quantity: number;
  unitBn: string;
  unitEn: string;
}

interface AdminOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "delivered" | "cancelled";
  createdAt: string;
}

// Initial 6 orders for management console
const initialAdminOrders: AdminOrder[] = [
  {
    id: "SSS-1001",
    customerName: "আব্দুর রহমান",
    phone: "01712345678",
    address: "বাসা ১২, রোড ৩, ধানমন্ডি, ঢাকা",
    items: [
      { productId: "13", nameBn: "ফ্রেশ পালং শাক", nameEn: "Fresh Spinach", price: 30, quantity: 2, unitBn: "২৫০ গ্রাম", unitEn: "250g" },
      { productId: "4", nameBn: "হোল হুইট ব্রেড", nameEn: "Whole Wheat Bread", price: 80, quantity: 1, unitBn: "৪০০ গ্রাম", unitEn: "400g" },
    ],
    totalAmount: 190,
    status: "pending",
    createdAt: "2026-07-13T10:15:00Z",
  },
  {
    id: "SSS-1002",
    customerName: "সুমি আক্তার",
    phone: "01887654321",
    address: "ফ্ল্যাট ৪বি, গুলশান, ঢাকা",
    items: [
      { productId: "8", nameBn: "সাগর কলা", nameEn: "Sagor Banana", price: 100, quantity: 1, unitBn: "১ ডজন", unitEn: "1 Dozen" },
      { productId: "2", nameBn: "খাঁটি সয়াবিন তেল", nameEn: "Pure Soybean Oil", price: 820, quantity: 1, unitBn: "৫ লিটার", unitEn: "5 Liter" },
    ],
    totalAmount: 970,
    status: "processing",
    createdAt: "2026-07-13T09:30:00Z",
  },
  {
    id: "SSS-1003",
    customerName: "মোহাম্মদ আলি",
    phone: "01911223344",
    address: "সেক্টর ৪, উত্তরা, ঢাকা",
    items: [
      { productId: "3", nameBn: "দেশী মসুর ডাল", nameEn: "Local Lentils", price: 140, quantity: 2, unitBn: "১ কেজি", unitEn: "1kg" },
    ],
    totalAmount: 330,
    status: "delivered",
    createdAt: "2026-07-12T15:45:00Z",
  },
  {
    id: "SSS-1004",
    customerName: "ফাতেমা বেগম",
    phone: "01555667788",
    address: "হালিশহর, চট্টগ্রাম",
    items: [
      { productId: "18", nameBn: "বেবি ডায়াপার লার্জ", nameEn: "Baby Diaper Large", price: 855, quantity: 1, unitBn: "৪৪ টি", unitEn: "44 Pack" },
      { productId: "17", nameBn: "বেবি ওয়াইপস", nameEn: "Baby Wipes", price: 220, quantity: 2, unitBn: "৮০ টি", unitEn: "80 Sheets" },
    ],
    totalAmount: 1345,
    status: "delivered",
    createdAt: "2026-07-12T11:20:00Z",
  },
  {
    id: "SSS-1005",
    customerName: "আহসান হাবিব",
    phone: "01711223344",
    address: "উপশহর, সিলেট",
    items: [
      { productId: "9", nameBn: "অর্গানিক আপেল", nameEn: "Organic Apple", price: 180, quantity: 2, unitBn: "১ কেজি", unitEn: "1kg" },
      { productId: "10", nameBn: "তাজা পেয়ারা", nameEn: "Fresh Guava", price: 90, quantity: 3, unitBn: "১ কেজি", unitEn: "1kg" },
    ],
    totalAmount: 680,
    status: "pending",
    createdAt: "2026-07-11T18:10:00Z",
  },
  {
    id: "SSS-1006",
    customerName: "নাসরিন সুলতানা",
    phone: "01666778899",
    address: "সোনাডাঙ্গা, খুলনা",
    items: [
      { productId: "5", nameBn: "প্যাকেট চিনি", nameEn: "Packet Sugar", price: 130, quantity: 2, unitBn: "১ কেজি", unitEn: "1kg" },
    ],
    totalAmount: 310,
    status: "processing",
    createdAt: "2026-07-11T14:05:00Z",
  },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const { t, language } = useApp();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderSortBy, setOrderSortBy] = useState<string>("newest");

  useEffect(() => {
    // Auth guard
    const isAuth = sessionStorage.getItem("sss_admin_auth");
    if (isAuth !== "true") {
      router.push("/admin/login");
      return;
    }

    // Load orders from sessionStorage
    const savedOrders = sessionStorage.getItem("sss_admin_orders");
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Failed to parse saved orders", e);
      }
    } else {
      setOrders(initialAdminOrders);
      sessionStorage.setItem("sss_admin_orders", JSON.stringify(initialAdminOrders));
    }
  }, [router]);

  const handleMarkCompleted = (orderId: string) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: "delivered" as const } : o));
    setOrders(updated);
    sessionStorage.setItem("sss_admin_orders", JSON.stringify(updated));
    const orderToPrint = updated.find(o => o.id === orderId);
    if (orderToPrint) {
      generateReceipt(orderToPrint);
    }
  };

  const generateReceipt = (order: AdminOrder) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const dateStr = new Date(order.createdAt).toLocaleString(language === "bn" ? "bn-BD" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${order.id}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: 80mm; 
            margin: 0 auto; 
            padding: 5mm; 
            color: #000;
            font-size: 12px;
            line-height: 1.4;
          }
          h1 { text-align: center; font-size: 18px; margin: 0 0 10px 0; border-bottom: 1px dashed #000; padding-bottom: 5px; }
          .section { margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          .bold { font-weight: bold; }
          .item-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .item-name { max-width: 65%; }
          .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px; }
          .footer { text-align: center; margin-top: 15px; font-size: 10px; border-top: 1px dashed #000; padding-top: 10px;}
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <h1>Smart Supper Shop</h1>
        <div class="section">
          <div><span class="bold">অর্ডার নম্বর:</span> ${order.id}</div>
          <div><span class="bold">তারিখ:</span> ${dateStr}</div>
        </div>
        
        <div class="section">
          <div class="bold" style="margin-bottom: 4px;">গ্রাহকের বিবরণ:</div>
          <div>${order.customerName}</div>
          <div>${order.phone}</div>
          <div>${order.address}</div>
        </div>

        <div class="section">
          <div class="bold" style="margin-bottom: 6px;">অর্ডারকৃত পণ্যসমূহ:</div>
          ${order.items.map(item => 
            "<div class='item-row'>" +
              "<div class='item-name'>" + item.quantity + "x " + (language === "bn" ? item.nameBn : item.nameEn) + "</div>" +
              "<div>৳" + (item.price * item.quantity) + "</div>" +
            "</div>"
          ).join("")}
        </div>

        <div class="total-row">
          <span>মোট মূল্য:</span>
          <span>৳${order.totalAmount}</span>
        </div>

        <div class="footer">
          ধন্যবাদ! আবার আসবেন।<br/>
          (Thank you! Visit again.)
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  // Stat computations
  const totalSalesToday = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const processingCount = orders.filter((o) => o.status === "processing").length;

  // Formatting helpers
  const f = (num: number) => (language === "bn" ? num.toLocaleString("bn-BD") : num);

  // Sorting
  const sortedOrders = [...orders].sort((a, b) => {
    if (orderSortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (orderSortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (orderSortBy === "amount-high") return b.totalAmount - a.totalAmount;
    if (orderSortBy === "amount-low") return a.totalAmount - b.totalAmount;
    return 0;
  });

  const getStatusBadge = (status: AdminOrder["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold gap-1 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            {t("অপেক্ষমান", "Pending")}
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold gap-1 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            {t("প্রক্রিয়াধীন", "Processing")}
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold gap-1 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
            {t("সম্পন্ন", "Completed")}
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold gap-1 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            {t("বাতিলকৃত", "Cancelled")}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen flex w-full">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative w-full pb-16 md:pb-0">
        
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 bg-surface-container-lowest shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary font-bold">
              {t("ড্যাশবোর্ড", "Dashboard")}
            </h1>
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

        {/* main catalog layout */}
        <main className="flex-1 p-margin-mobile md:p-margin-desktop mt-4">
          <div className="max-w-[1200px] mx-auto space-y-6">
            
            {/* Header Title */}
            <div>
              <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold font-tiro">
                {t("অর্ডার ব্যবস্থাপনা", "Orders Management")}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {t(
                  "গ্রাহকদের দেওয়া ক্যাশ অন ডেলিভারি অর্ডারগুলো দেখুন ও আপডেট করুন।",
                  "View and update cash-on-delivery orders placed by customers."
                )}
              </p>
            </div>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Sales Today Card */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
                    <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-0.5">
                      {t("আজকের মোট বিক্রি (ডেলিভার্ড)", "Total Sales Today")}
                    </p>
                    <p className="font-headline-lg text-2xl text-on-surface font-bold">৳ {f(totalSalesToday)}</p>
                  </div>
                </div>
              </div>

              {/* Pending Orders Card */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-error-container/5 rounded-full blur-xl group-hover:bg-error-container/10 transition-colors"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">pending_actions</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-0.5">
                      {t("অপেক্ষমান অর্ডার", "Pending Orders")}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="font-headline-lg text-2xl text-on-surface font-bold">{f(pendingCount)}</p>
                      {pendingCount > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[9px] animate-pulse">
                          {t("অ্যাকশন প্রয়োজন", "Action Needed")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Orders Card */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-container/5 rounded-full blur-xl group-hover:bg-secondary-container/10 transition-colors"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-0.5">
                      {t("প্রক্রিয়াধীন অর্ডার", "Orders Processing")}
                    </p>
                    <p className="font-headline-lg text-2xl text-on-surface font-bold">{f(processingCount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Data Area */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 bg-surface-container-low/50">
                <h2 className="font-headline-sm text-lg font-bold text-on-surface">{t("সকল অর্ডার", "All Orders")}</h2>
                <select
                  value={orderSortBy}
                  onChange={(e) => setOrderSortBy(e.target.value)}
                  className="bg-surface border border-outline-variant/60 rounded-xl px-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                >
                  <option value="newest">{t("নতুন থেকে পুরাতন", "Newest First")}</option>
                  <option value="oldest">{t("পুরাতন থেকে নতুন", "Oldest First")}</option>
                  <option value="amount-high">{t("বেশি মূল্য", "Amount (High to Low)")}</option>
                  <option value="amount-low">{t("কম মূল্য", "Amount (Low to High)")}</option>
                </select>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/40 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      <th className="p-4 w-32">{t("অর্ডার নম্বর", "Order Number")}</th>
                      <th className="p-4">{t("গ্রাহকের বিবরণ", "Customer Details")}</th>
                      <th className="p-4">{t("তারিখ", "Date")}</th>
                      <th className="p-4 w-40">{t("অর্ডারকৃত পণ্যসমূহ", "Items")}</th>
                      <th className="p-4 w-28 text-right">{t("মোট মূল্য", "Total BDT")}</th>
                      <th className="p-4 w-32 text-center">{t("অবস্থা", "Status")}</th>
                      <th className="p-4 w-36 text-right">{t("অ্যাকশন", "Action")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-sm">
                    {sortedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-on-surface-variant font-medium">
                          {t("কোনো অর্ডার পাওয়া যায়নি", "No orders found")}
                        </td>
                      </tr>
                    ) : (
                      sortedOrders.map((order) => {
                        const isCompleted = order.status === "delivered";
                        const formattedDate = new Date(order.createdAt).toLocaleString(
                          language === "bn" ? "bn-BD" : "en-US",
                          { dateStyle: "medium", timeStyle: "short" }
                        );

                        return (
                          <tr key={order.id} className="hover:bg-surface-container transition-colors group">
                            {/* Order Num */}
                            <td className="p-4 font-bold text-on-surface">#{order.id}</td>
                            
                            {/* Customer info */}
                            <td className="p-4 leading-normal">
                              <div className="font-bold text-on-surface">{order.customerName}</div>
                              <div className="text-xs text-on-surface-variant font-semibold">{order.phone}</div>
                              <div className="text-xs text-muted max-w-[200px] truncate" title={order.address}>
                                {order.address}
                              </div>
                            </td>

                            {/* Date */}
                            <td className="p-4 text-xs text-on-surface-variant">{formattedDate}</td>

                            {/* Purchased Items list */}
                            <td className="p-4 text-xs space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="line-clamp-1">
                                  <span className="font-bold text-on-surface">{f(item.quantity)}x</span>{" "}
                                  {t(item.nameBn, item.nameEn)}
                                </div>
                              ))}
                            </td>

                            {/* Total BDT */}
                            <td className="p-4 font-bold text-on-surface text-right">
                              ৳{f(order.totalAmount)}
                            </td>

                            {/* Status Badge */}
                            <td className="p-4 text-center">{getStatusBadge(order.status)}</td>

                            {/* Actions button */}
                            <td className="p-4 text-right">
                              {isCompleted ? (
                                <button
                                  type="button"
                                  disabled
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant text-on-surface-variant rounded-full text-xs hover:bg-surface-container transition-colors disabled:opacity-50 font-bold"
                                >
                                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                                  {t("দেখুন", "View")}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleMarkCompleted(order.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-green text-on-primary rounded-full text-xs shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer font-bold"
                                >
                                  <span className="material-symbols-outlined text-[14px]">check</span>
                                  {t("সম্পন্ন করুন", "Complete")}
                                </button>
                              )}
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
                {sortedOrders.length === 0 ? (
                  <div className="text-center py-6 text-on-surface-variant font-medium">
                    {t("কোনো অর্ডার পাওয়া যায়নি", "No orders found")}
                  </div>
                ) : (
                  sortedOrders.map((order) => {
                    const isCompleted = order.status === "delivered";
                    const formattedDate = new Date(order.createdAt).toLocaleString(
                      language === "bn" ? "bn-BD" : "en-US",
                      { dateStyle: "medium", timeStyle: "short" }
                    );

                    return (
                      <div
                        key={order.id}
                        className={`bg-surface border rounded-xl p-4 shadow-sm relative overflow-hidden ${
                          order.status === "pending"
                            ? "border-red-200"
                            : order.status === "processing"
                            ? "border-orange-200"
                            : "border-outline-variant/40"
                        }`}
                      >
                        {/* Side color stripe */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${
                            order.status === "pending"
                              ? "bg-red-500"
                              : order.status === "processing"
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                        ></div>

                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-0.5">
                              {t("অর্ডার ", "Order ")} #{order.id}
                            </p>
                            <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                              {order.customerName}
                            </p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>

                        {/* Items list details */}
                        <div className="text-xs text-on-surface-variant space-y-0.5 my-2 pl-1 border-l border-outline-variant/30">
                          {order.items.map((item, idx) => (
                            <div key={idx}>
                              <span className="font-bold text-on-surface">{f(item.quantity)}x</span>{" "}
                              {t(item.nameBn, item.nameEn)}
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-end mt-3 pt-3 border-t border-outline-variant/40">
                          <div>
                            <p className="font-micro text-micro text-on-surface-variant">{formattedDate}</p>
                            <p className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">
                              ৳{f(order.totalAmount)}
                            </p>
                          </div>

                          {/* Action button */}
                          {isCompleted ? (
                            <button
                              type="button"
                              onClick={() => generateReceipt(order)}
                              className="inline-flex items-center gap-1 px-4 py-2 border border-primary text-primary rounded-full text-xs font-bold hover:bg-primary/10 transition-colors justify-center w-32 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">print</span>
                              {t("প্রিন্ট রসিদ", "Print Receipt")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMarkCompleted(order.id)}
                              className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-green text-on-primary rounded-full text-xs font-bold shadow-sm active:scale-95 transition-transform justify-center w-32 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span>
                              {t("সম্পন্ন করুন", "Complete")}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
