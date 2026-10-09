import SiteHeader from "../../../components/site-header";
import CommerceFooter from "../../../components/commerce-footer";
import type { Metadata } from "next";
import NotificationInbox from "./notification-inbox";
import styles from "../account.module.css";

export const metadata: Metadata = { title: "Bildirimlerim | Xinobi", description: "Sipariş, kargo, iptal ve iade bildirimleriniz." };

export default function NotificationsPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#notifications">Bildirimlere geç</a>
    <SiteHeader />
    <main id="notifications"><NotificationInbox /></main>
    <CommerceFooter />
  </div>;
}
