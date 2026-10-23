import type { Metadata } from "next";
import { Inter, Inter_Tight, Jost } from "next/font/google";
import "./globals.css";
import LegalConsent from "./legal-consent";
import CompareTray from "../components/compare-tray";
import NobiLauncher from "../components/nobi/nobi-launcher";
import { siteMetadata } from "../lib/seo";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], display: "swap" });
// Display face for product detail and XINOBI U titles/prices; not preloaded because only those pages use it.
const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin", "latin-ext"], weight: ["500", "600", "700"], display: "swap", preload: false });
// Header typeface: open-licence geometric sans closest to the measured Dyson Futura header (owner request, 07.10.2026).
const jost = Jost({ variable: "--font-jost", subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  ...siteMetadata,
  title: "Xinobi | Sessiz teknoloji",
  description: "Xinobi ev teknolojilerini, kişisel seçimleri ve yalın tasarımı keşfedin.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="tr" className={`${inter.variable} ${interTight.variable} ${jost.variable}`}><body>{children}<CompareTray /><NobiLauncher /><LegalConsent /></body></html>;
}
