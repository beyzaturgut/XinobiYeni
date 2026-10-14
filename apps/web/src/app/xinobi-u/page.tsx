import type { Metadata } from 'next';
import { pageMetadata } from "../../lib/seo";
import StudioHeader from './studio-header';
import PersonalizableProducts from './products';
export const metadata: Metadata = pageMetadata("/xinobi-u/", { title: 'XINOBI U | Sana özel tasarım', description: 'Ürününü seç, beş soruyu yanıtla, AI tasarımını ürününde keşfet.' });
export default function Page() { return <><StudioHeader /><PersonalizableProducts /></>; }
