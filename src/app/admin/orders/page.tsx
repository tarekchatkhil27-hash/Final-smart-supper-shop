"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { insforge } from "@/lib/insforge";

interface AdminOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "delivered" | "cancelled" | "Pending Payment" | "Paid" | "Shipped";
  createdAt: string;
  shortId?: string;
  deliveryFee: number;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { t, language } = useApp();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderSortBy, setOrderSortBy] = useState<string>("newest");

  useEffect(() => {
    // Auth guard is handled in layout

    const loadOrders = async () => {
      const { data, error } = await insforge.database
        .from("Orders")
        .select(`
          *,
          Order_Items (
            *,
            Products (*)
          )
        `)
        .order("created_at", { ascending: false });

      if (data) {
        const mappedOrders: AdminOrder[] = data.map((o: any) => ({
          id: o.id,
          customerName: o.customer_name || "Unknown",
          phone: o.customer_phone || "",
          address: o.customer_address || "",
          status: o.status,
          totalAmount: parseFloat(o.total_amount || "0"),
          deliveryFee: parseFloat(o.delivery_fee || "0"),
          createdAt: o.created_at,
          items: (o.Order_Items || []).map((item: any) => ({
            productId: item.product_id,
            nameBn: item.Products?.name || "Unknown",
            nameEn: item.Products?.name || "Unknown",
            price: parseFloat(item.price_at_time || "0"),
            quantity: item.quantity,
            unitBn: "১ কেজি",
            unitEn: "1kg"
          }))
        }));

        // To calculate stable serials (1st order = 01, 2nd = 02), we must process them in chronological order
        mappedOrders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const dateCounters: Record<string, number> = {};
        mappedOrders.forEach(o => {
          const d = new Date(o.createdAt);
          const day = d.getDate().toString().padStart(2, '0');
          const month = d.toLocaleString('en-US', { month: 'short' });
          const key = `${day}-${month}`;
          dateCounters[key] = (dateCounters[key] || 0) + 1;
          const serial = dateCounters[key].toString().padStart(2, '0');
          o.shortId = `${key}-${serial}`;
        });

        // Re-sort to newest first
        mappedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setOrders(mappedOrders);
      }
    };
    loadOrders();
  }, [router]);

  const handleMarkCompleted = async (orderId: string, newStatus: string) => {
    const { error } = await insforge.database
      .from("Orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o));
      setOrders(updated);
      
      if (newStatus === "Paid" || newStatus === "delivered") {
        const orderToPrint = updated.find(o => o.id === orderId);
        if (orderToPrint) {
          generateReceipt(orderToPrint);
        }
      }
    } else {
      alert("Error updating order status.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(t("আপনি কি নিশ্চিত যে আপনি এই অর্ডারটি মুছে ফেলতে চান? এটি পুনরায় ফিরিয়ে আনা সম্ভব নয়।", "Are you sure you want to delete this order? This cannot be undone."))) {
      return;
    }

    const { error } = await insforge.database
      .from("Orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      alert("Error deleting order: " + error.message);
    } else {
      setOrders(orders.filter(o => o.id !== orderId));
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
          <div><span class="bold">অর্ডার নম্বর:</span> ${order.shortId || order.id}</div>
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
          <div class='item-row' style="margin-top: 5px; border-top: 1px dotted #ccc; padding-top: 4px;">
            <div class='item-name'>ডেলিভারি ফি (Delivery Fee):</div>
            <div>৳${order.deliveryFee}</div>
          </div>
        </div>

        <div class="total-row">
          <span>সর্বমোট মূল্য:</span>
          <span>৳${order.totalAmount + order.deliveryFee}</span>
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
    .filter((o) => o.status === "delivered" || o.status === "Paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "Pending Payment").length;
  const processingCount = orders.filter((o) => o.status === "processing" || o.status === "Shipped").length;

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
      case "Pending Payment":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold gap-1 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            {t("অপেক্ষমান", status)}
          </span>
        );
      case "processing":
      case "Shipped":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold gap-1 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            {t("প্রক্রিয়াধীন", status)}
          </span>
        );
      case "delivered":
      case "Paid":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold gap-1 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
            {t("সম্পন্ন", status)}
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold gap-1 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            {t("বাতিলকৃত", status)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold gap-1 border border-gray-200">
            {status}
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
                      <th className="p-4 w-24 text-right">{t("ডেলিভারি", "Delivery")}</th>
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
                            <td className="p-4 leading-normal">
                              <div className="font-bold text-on-surface text-base">#{order.shortId || order.id.substring(0, 8)}</div>
                              <div className="text-xs font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded inline-block mt-1">
                                {order.id.substring(0, 8)}
                              </div>
                            </td>
                            
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

                            {/* Delivery Fee */}
                            <td className="p-4 font-bold text-on-surface text-right">
                              ৳{f(order.deliveryFee)}
                            </td>

                            {/* Total BDT */}
                            <td className="p-4 font-bold text-on-surface text-right">
                              ৳{f(order.totalAmount + order.deliveryFee)}
                            </td>

                            {/* Status Badge */}
                            <td className="p-4 text-center">{getStatusBadge(order.status)}</td>

                            <td className="p-4 text-right flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/orders/${order.id}/edit`}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
                                title="Edit Order"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(order.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                title="Delete Order"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => generateReceipt(order)}
                                className="inline-flex items-center gap-1 px-2 py-1.5 border border-primary text-primary rounded-lg text-xs font-bold hover:bg-primary/10 transition-colors cursor-pointer"
                                title="Print Receipt"
                              >
                                <span className="material-symbols-outlined text-[16px]">print</span>
                              </button>
                              <select
                                value={order.status}
                                onChange={(e) => handleMarkCompleted(order.id, e.target.value)}
                                className="bg-surface border border-outline-variant/60 rounded-xl px-2 py-1.5 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                              >
                                <option value="Pending Payment">Pending Payment</option>
                                <option value="Paid">Paid</option>
                                <option value="Shipped">Shipped</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
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
                            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-0.5 flex items-center gap-2">
                              <span>{t("অর্ডার ", "Order ")} #{order.shortId || order.id.substring(0, 8)}</span>
                              <span className="font-mono text-[10px] normal-case bg-surface-container px-1 rounded">{order.id.substring(0, 8)}</span>
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
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-micro text-micro text-on-surface-variant font-bold">{t("ডেলিভারি:", "Delivery:")}</span>
                              <span className="text-xs font-bold text-on-surface">৳{f(order.deliveryFee)}</span>
                            </div>
                            <p className="font-micro text-micro text-on-surface-variant">{formattedDate}</p>
                            <p className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">
                              ৳{f(order.totalAmount + order.deliveryFee)}
                            </p>
                          </div>

                          {/* Action button */}
                          <div className="flex gap-2 items-center flex-wrap mt-2">
                            <Link
                              href={`/admin/orders/${order.id}/edit`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
                              title="Edit Order"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                              title="Delete Order"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => generateReceipt(order)}
                              className="inline-flex items-center justify-center w-8 h-8 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                              title="Print Receipt"
                            >
                              <span className="material-symbols-outlined text-[16px]">print</span>
                            </button>
                            <select
                              value={order.status}
                              onChange={(e) => handleMarkCompleted(order.id, e.target.value)}
                              className="bg-surface border border-outline-variant/60 rounded-xl px-2 py-1 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                            >
                              <option value="Pending Payment">Pending Payment</option>
                              <option value="Paid">Paid</option>
                              <option value="Shipped">Shipped</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
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
