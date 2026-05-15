import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import PWAInit from "@/components/PWAInit";
import OfflineIndicator from "@/components/OfflineIndicator";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Phoenix International School Ghana",
  description: "School management system for Phoenix International School Ghana.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Phoenix School",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0A1E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ style: { borderRadius: "12px", fontWeight: 600, fontSize: "13px" } }} />
          <OfflineIndicator />
          <PWAInit />
        </AuthProvider>
      </body>
    </html>
  );
}
