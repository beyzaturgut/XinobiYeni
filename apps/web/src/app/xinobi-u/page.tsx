import type { Metadata } from 'next';
import StudioHeader from './studio-header';
import PersonalizableProducts from './products';
export const metadata: Metadata = { title: 'XINOBI U | Sana özel tasarım', description: 'Ürününü seç, beş soruyu yanıtla, AI tasarımını ürününde keşfet.' };
export default function Page() { return <><StudioHeader /><PersonalizableProducts /></>; }
