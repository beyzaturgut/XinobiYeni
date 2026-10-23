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

// Marks pages opened by the mobile app (?mobile=1 or the app's bridge) before first paint, so the site chrome and the
// cookie panel never flash inside the WebView; client navigations keep the attribute. Links that leave the design
// pages become real navigations there, so the app can open its own cart, favourites or account screen instead of
// rendering the website inside the WebView.
const embeddedScript = `try{if(/[?&]mobile=1(&|$)/.test(location.search)||window.XinobiCommerce){document.documentElement.dataset.embedded='app';document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a||a.target||e.defaultPrevented)return;var u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname.indexOf('/xinobi-u/')===0||u.pathname.indexOf('/hesap/tasarimlarim/onizleme')===0)return;e.preventDefault();e.stopPropagation();location.assign(u.href)},true)}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="tr" className={`${inter.variable} ${interTight.variable} ${jost.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: embeddedScript }} /></head><body>{children}<CompareTray /><NobiLauncher /><LegalConsent /></body></html>;
}
