"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { insforge } from "@/lib/insforge";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await insforge.auth.getCurrentUser();
        const isAuthenticated = !!data?.user;

        if (!isAuthenticated && pathname !== "/admin/login") {
          router.replace("/admin/login");
        } else if (isAuthenticated && (pathname === "/admin/login" || pathname === "/admin")) {
          router.replace("/admin/products");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-semibold">Loading Admin...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
