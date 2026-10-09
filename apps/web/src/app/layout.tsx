import type { Metadata } from "next";
import { Inter, Jost } from "next/font/google";
import "./globals.css";
import LegalConsent from "./legal-consent";
import CompareTray from "../components/compare-tray";
import NobiLauncher from "../components/nobi/nobi-launcher";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], display: "swap" });
// Header typeface: open-licence geometric sans closest to the measured Dyson Futura header (owner request, 07.10.2026).
const jost = Jost({ variable: "--font-jost", subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  title: "Xinobi | Sessiz teknoloji",
  description: "Xinobi ev teknolojilerini, kişisel seçimleri ve yalın tasarımı keşfedin.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="tr" className={`${inter.variable} ${jost.variable}`}><body>{children}<CompareTray /><NobiLauncher /><LegalConsent /></body></html>;
}
