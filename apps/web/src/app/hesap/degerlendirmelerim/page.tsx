import AccountRequestState from "../../../components/account-request-state";
import type { Metadata } from "next";
import CommerceFooter from "../../../components/commerce-footer";
import SiteHeader from "../../../components/site-header";
import accountStyles from "../account.module.css";
import MyReviews from "./reviews";

export const metadata: Metadata = { title: "Değerlendirmelerim | Xinobi", description: "Satın aldığınız ürünlere ait değerlendirmelerinizi yönetin." };

export default function MyReviewsPage() {
  return <div className={accountStyles.page}>
    <a data-skip-link className={accountStyles.skipLink} href="#reviews">Değerlendirmelere geç</a>
    <SiteHeader />
    <main id="reviews"><AccountRequestState resource="orders"><MyReviews /></AccountRequestState></main>
    <CommerceFooter />
  </div>;
}
