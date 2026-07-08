import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Creative Interiors | ERP",
    template: "%s | Creative Interiors ERP"
  },
  description: "Comprehensive Enterprise Resource Planning system for Creative Interiors Hardware Department. Manage products, customers, and generate beautiful quotations effortlessly.",
  keywords: ["ERP", "Creative Interiors", "Hardware", "Quotations", "Inventory Management", "Business Software"],
  authors: [{ name: "Creative Interiors" }],
  creator: "Creative Interiors",
  publisher: "Creative Interiors",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Creative Interiors ERP",
    title: "Creative Interiors | ERP Dashboard",
    description: "Enterprise Resource Planning system for Creative Interiors Hardware Department.",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Creative Interiors ERP Dashboard"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Creative Interiors | ERP",
    description: "Comprehensive Enterprise Resource Planning system for Creative Interiors.",
    images: ["/og-image.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
