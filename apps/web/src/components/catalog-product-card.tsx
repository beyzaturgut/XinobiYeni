"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "../app/urunler/catalog.module.css";

export const catalogFavoriteStorageKey = "xinobi-demo-favorites";

export type CatalogProductCardData = {
  id: string;
  name: string;
  family: string;
  color: string;
  swatch: string;
  image: StaticImageData | string;
  colorCount?: number;
  tall?: boolean;
};

type CatalogProductCardProps = {
  product: CatalogProductCardData;
  action: ReactNode;
  cardHref?: string;
  actionHref?: string;
  favorite?: boolean;
  onToggleFavorite?: () => void;
};

function Media({ product }: { product: CatalogProductCardData }) {
  return <div className={styles.media}>
    {(product.colorCount || 0) > 1 && <span className={styles.multiColorBadge}>◉ {product.colorCount} renk</span>}
    <span className={styles.demoBadge}>Xinobi</span>
    {product.image ? <Image className={product.tall ? styles.tallImage : ""} src={product.image} width={600} height={600} alt={`${product.name}, ${product.color}`} sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 32vw" /> : <span>Görsel yok</span>}
  </div>;
}

function Details({ product, action }: Pick<CatalogProductCardProps, "product" | "action">) {
  return <div className={styles.cardBody}>
    <p>{product.family}</p>
    <h2>{product.name}</h2>
    <div className={styles.variant}><span style={{ backgroundColor: product.swatch }} /><span>{(product.colorCount || 0) > 1 ? `${product.colorCount} renk seçeneği` : product.color}</span></div>
    <div className={styles.cardFooter}>{action}</div>
  </div>;
}

function InteractiveContent({ product, cardHref, actionHref, action }: Required<Pick<CatalogProductCardProps, "product" | "cardHref" | "actionHref" | "action">>) {
  return <div className={styles.cardLink}>
    <Link className={styles.cardMediaLink} href={cardHref}><Media product={product} /></Link>
    <div className={styles.cardBody}>
      <Link className={styles.cardIdentityLink} href={cardHref}>
        <p>{product.family}</p>
        <h2>{product.name}</h2>
        <div className={styles.variant}><span style={{ backgroundColor: product.swatch }} /><span>{(product.colorCount || 0) > 1 ? `${product.colorCount} renk seçeneği` : product.color}</span></div>
      </Link>
      <div className={styles.cardFooter}><Link href={actionHref}>{action}</Link></div>
    </div>
  </div>;
}

export default function CatalogProductCard({ product, action, cardHref, actionHref, favorite = false, onToggleFavorite }: CatalogProductCardProps) {
  const interactive = Boolean(cardHref && actionHref);
  const content = interactive
    ? <InteractiveContent product={product} cardHref={cardHref!} actionHref={actionHref!} action={action} />
    : cardHref
      ? <Link className={styles.cardLink} href={cardHref}><Media product={product} /><Details product={product} action={action} /></Link>
      : <div className={styles.cardLink}><Media product={product} /><Details product={product} action={action} /></div>;
  return <article className={styles.card}>
    {content}
    {onToggleFavorite && <button type="button" className={styles.favoriteButton} aria-label={`${product.name} ${product.color} ürününü ${favorite ? "favorilerden çıkar" : "favorilere ekle"}`} aria-pressed={favorite} onClick={onToggleFavorite}><span aria-hidden="true">{favorite ? "♥" : "♡"}</span></button>}
  </article>;
}
