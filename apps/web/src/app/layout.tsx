import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LegalConsent from "./legal-consent";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  title: "Xinobi | Sessiz teknoloji",
  description: "Xinobi ev teknolojilerini, kişisel seçimleri ve yalın tasarımı keşfedin.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="tr" className={inter.variable}><body>{children}<LegalConsent /></body></html>;
}
