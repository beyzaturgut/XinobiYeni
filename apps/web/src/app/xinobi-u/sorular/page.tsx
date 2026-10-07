import { Suspense } from 'react';
import StudioHeader from '../studio-header';
import Questionnaire from './questionnaire';
export default function Page() { return <><StudioHeader /><Suspense fallback={<p>Sorular hazırlanıyor…</p>}><Questionnaire /></Suspense></>; }
