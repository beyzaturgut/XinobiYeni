import AccountRequestState from "../../../components/account-request-state";
import SiteHeader from "../../../components/site-header";
import CommerceFooter from "../../../components/commerce-footer";
import type { Metadata } from "next";
import Addresses from "./addresses";
import styles from "../account.module.css";

export const metadata: Metadata = { title: "Adreslerim | Xinobi", description: "Xinobi teslimat adreslerinizi yönetin." };

export default function AddressesPage() {
  return <div className={styles.page}>
    <a data-skip-link className={styles.skipLink} href="#addresses">Adreslere geç</a>
    <SiteHeader />
    <main id="addresses"><AccountRequestState resource="addresses"><Addresses /></AccountRequestState></main>
    <CommerceFooter />
  </div>;
}
