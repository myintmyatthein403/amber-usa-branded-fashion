import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementModal from "@/components/modals/AnnouncementModal";
import Preloader from "@/components/Preloader";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amber Brand Fashion | Modern Myanmar Heritage",
  description: "A high-end minimalist e-commerce experience for Amber Brand Fashion, blending modern silhouettes with traditional Myanmar craftsmanship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased font-sans`}
      >
        <Preloader />
        {children}
        <CartDrawer />
        <AnnouncementModal />
      </body>
    </html>
  );
}
