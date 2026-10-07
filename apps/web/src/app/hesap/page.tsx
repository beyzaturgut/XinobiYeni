import SiteHeader from "../../components/site-header";
import CommerceFooter from "../../components/commerce-footer";
import type { Metadata } from "next";
import AccountDashboard from "./account-dashboard";
import styles from "./account.module.css";

export const metadata: Metadata = { title: "Hesabım | Xinobi", description: "Xinobi hesabınızı, deneme siparişlerinizi, favorilerinizi ve sepetinizi yönetin." };

export default function AccountPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#account">Hesap içeriğine geç</a>
    <SiteHeader />
    <main id="account"><AccountDashboard /></main>
    <CommerceFooter />
  </div>;
}
