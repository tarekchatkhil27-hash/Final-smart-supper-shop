import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "Smart Supper Shop",
  description: "বাজার এখন ঘরে | Fresh e-commerce grocery online shop in Bangladesh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="h-full">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;500;600;700&family=Noto+Serif:ital,wght@0,100..900;1,100..900&family=Tiro+Bangla:ital@0;1&display=swap"
          rel="stylesheet"
        />
        {/* Material Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* Font Awesome Icons */}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          rel="stylesheet"
          precedence="default"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AppProvider>
          {children}
        </AppProvider>
        
        {/* Unregister old PWA Service Worker to fix cache crash issues */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister().then(function(boolean) {
                      console.log('Old Service Worker unregistered to prevent fetch crashes');
                    });
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
