import type { Metadata } from "next";
import CommerceFooter from "../../../components/commerce-footer";
import SiteHeader from "../../../components/site-header";
import accountStyles from "../account.module.css";
import MyReviews from "./reviews";

export const metadata: Metadata = { title: "Değerlendirmelerim | Xinobi", description: "Satın aldığınız ürünlere ait değerlendirmelerinizi yönetin." };

export default function MyReviewsPage() {
  return <div className={accountStyles.page}>
    <a className={accountStyles.skipLink} href="#reviews">Değerlendirmelere geç</a>
    <SiteHeader />
    <main id="reviews"><MyReviews /></main>
    <CommerceFooter />
  </div>;
}
