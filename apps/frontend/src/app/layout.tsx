import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import CartDrawer from "@/components/CartDrawer";
import CompareDrawer from "@/components/CompareDrawer";
import Footer from "@/components/Footer";
import AnnouncementModal from "@/components/modals/AnnouncementModal";
import Preloader from "@/components/Preloader";
import ToastContainer from "@/components/ToastContainer";
import FeedbackWidget from "@/components/FeedbackWidget";
import { Providers } from "@/context/Providers";
import { getSiteUrl } from "@/lib/seo";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Amber Brand Fashion | Modern Myanmar Heritage",
  description: "A high-end minimalist e-commerce experience for Amber Brand Fashion, blending modern silhouettes with traditional Myanmar craftsmanship.",
  openGraph: {
    type: "website",
    siteName: "Amber Brand Fashion",
    title: "Amber Brand Fashion | Modern Myanmar Heritage",
    description: "A high-end minimalist e-commerce experience for Amber Brand Fashion, blending modern silhouettes with traditional Myanmar craftsmanship.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased font-sans`}
      >
        <Providers>
          <Preloader />
          {children}
          <Footer />
          <CartDrawer />
          <CompareDrawer />
          <AnnouncementModal />
          <ToastContainer />
          <FeedbackWidget />
        </Providers>
      </body>
    </html>
  );
}
