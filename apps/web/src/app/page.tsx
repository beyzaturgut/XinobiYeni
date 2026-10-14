import type { Metadata } from "next";
import HomePage from "./home-page";
import { organizationJsonLd, pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata("/", {
  title: "Xinobi | Sessiz teknoloji",
  description: "Xinobi ev teknolojilerini, kişisel seçimleri ve yalın tasarımı keşfedin.",
});

export default function Page() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJsonLd() }} />
    <HomePage />
  </>;
}
