import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import PWAInit from "@/components/PWAInit";
import OfflineIndicator from "@/components/OfflineIndicator";
import RootErrorBoundary from "@/components/RootErrorBoundary";
import WhatsNewModal from "@/components/WhatsNewModal";
import UrgentNotificationBridge from "@/components/UrgentNotificationBridge";

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
    <html lang="en" className={inter.variable} data-theme="light">
      <script dangerouslySetInnerHTML={{__html: `
        try {
          const theme = localStorage.getItem('phoenixTheme') || 'light';
          document.documentElement.setAttribute('data-theme', theme);
          document.documentElement.style.colorScheme = theme;
        } catch {}
      `}} />
      <body className="min-h-screen">
        <RootErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-center"
                containerStyle={{ top: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
                toastOptions={{ style: { borderRadius: "12px", fontWeight: 600, fontSize: "13px", maxWidth: "90vw" } }} />
              <OfflineIndicator />
              <PWAInit />
              <WhatsNewModal />
              <UrgentNotificationBridge />
            </AuthProvider>
          </ThemeProvider>
        </RootErrorBoundary>
      </body>
    </html>
  );
}
