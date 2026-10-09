'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { commerceApi, mediaUrl } from '../../../lib/commerce';
import { browserId, designRequest, rememberSession, sessionKey, studioAsset, type DesignSession } from '../../../lib/design-studio';
import styles from '../studio.module.css';
export default function Questionnaire() {
  const params = useSearchParams(); const router = useRouter();
  // Colour is not chosen (the pattern covers the body); without `variant` the server uses the first photographed variant.
  const product = params.get('product') || 'DEMO-P101', variant = params.get('variant') || '';
  const [session, setSession] = useState<DesignSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0), [error, setError] = useState(''), [busy, setBusy] = useState(false), [revision, setRevision] = useState(0);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const starting = useRef<Promise<DesignSession> | null>(null);
  const startingKey = useRef('');
  useEffect(() => {
    let active = true;
    async function load() {
      const existing = sessionStorage.getItem(sessionKey(product, variant));
      if (existing) {
        try { return await designRequest<DesignSession>(`/sessions/${existing}`); } catch { sessionStorage.removeItem(sessionKey(product, variant)); }
      }
      return designRequest<DesignSession>('/sessions', 'POST', { productId: product, variantId: variant || null, browserId: browserId() });
    }
    const key = `${product}:${variant}:${revision}`;
    if (startingKey.current !== key) { startingKey.current = key; starting.current = null; }
    starting.current ??= load();
    starting.current.then(data => {
      if (!active) return;
      // Also remember it under the requested key (variant may be empty) so a reload resumes the same questionnaire.
      rememberSession(data); sessionStorage.setItem(sessionKey(product, variant), data.id); setSession(data);
      const saved = data.answers.length ? Object.fromEntries(data.answers.map(answer => [answer.questionId, answer.optionId])) : JSON.parse(sessionStorage.getItem(`xinobi-u-answers:${data.id}`) || '{}');
      setAnswers(saved); setError('');
    }).catch(error => { if (active) setError(error instanceof Error ? error.message : 'Sorular yüklenemedi.'); });
    designRequest<{ configured: boolean }>('/status').then(status => { if (active) setConfigured(status.configured); }).catch(() => { if (active) setConfigured(false); });
    return () => { active = false; };
  }, [product, variant, revision]);
  const status = session?.status;
  const sessionId = session?.id;
  useEffect(() => {
    if (!sessionId || (status !== 'queued' && status !== 'running')) return;
    let active = true;
    const refresh = async () => {
      try { const data = await designRequest<DesignSession>(`/sessions/${sessionId}`); if (active) { setSession(data); setError(''); } }
      catch (error) { if (active) setError(error instanceof Error ? error.message : 'Bağlantı kesildi. Aynı üretim durumu yeniden kontrol ediliyor.'); }
    };
    const timer = window.setInterval(refresh, 2000);
    void refresh();
    return () => { active = false; window.clearInterval(timer); };
  }, [sessionId, status]);
  function choose(id: string, option: string) { const next = { ...answers, [id]: option }; setAnswers(next); if (session) sessionStorage.setItem(`xinobi-u-answers:${session.id}`, JSON.stringify(next)); }
  function navigateStep(next: number) { setStep(next); requestAnimationFrame(() => heading.current?.focus()); }
  function restart() {
    if (session && (status === 'queued' || status === 'running')) return;
    sessionStorage.removeItem(sessionKey(product, variant)); starting.current = null; setSession(null); setAnswers({}); setStep(0); setError(''); setRevision(value => value + 1);
  }
  async function generate() {
    if (!session || busy) return;
    setBusy(true); setError('');
    try { const data = await designRequest<DesignSession>(`/sessions/${session.id}/generation`, 'POST', { answers: session.questions.map(question => ({ questionId: question.id, optionId: answers[question.id] })) }); setSession(data); rememberSession(data); }
    catch (error) { setError(error instanceof Error ? error.message : 'Üretim başlatılamadı.'); }
    finally { setBusy(false); }
  }
  if (!session) return <main className={styles.main}><p role="status">{error || 'Sana özel sorular hazırlanıyor…'}</p>{error && <><button className={styles.primary} onClick={restart}>Tekrar dene</button><Link href="/xinobi-u">Ürün seçimine dön</Link></>}</main>;
  const question = session.questions[step];
  const complete = session.questions.every(q => Boolean(answers[q.id]));
  const generating = status === 'queued' || status === 'running';
  return <main className={styles.main}><div className={styles.questionLayout}><aside className={styles.selection}><div className={styles.selectionImage}><Image src={mediaUrl(session.variant.image, commerceApi)} alt={session.product.name} width={500} height={600} /></div><p className={styles.kicker}>Seçtiğin ürün</p><h2>{session.product.name}</h2><Link href="/xinobi-u">Başka ürün seç ↗</Link></aside><section className={styles.questionPanel} aria-live="polite">
    {status === 'questionnaire' && step >= 5 && <button className={styles.freshQuestions} onClick={restart} disabled={busy}>Yeni sorular seç ↻</button>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    {generating ? <div className={styles.result}><p className={styles.kicker}>Tercihlerin tasarıma dönüşüyor</p><h1>Tasarımın hazırlanıyor.</h1><div className={styles.loader} /><p>Bu işlem biraz sürebilir. Sayfayı yenilesen de aynı üretime devam edebilirsin.</p></div> : status === 'failed' ? <div className={styles.result}><h1>Tasarım tamamlanamadı.</h1><p role="alert">{session.errorMessage}</p><button className={styles.primary} onClick={restart}>Yeni bir tasarım yolculuğu başlat</button></div> : status === 'ready' && session.imageUrl ? <div className={styles.result}><p className={styles.kicker}>Senin cevapların. Senin tasarımın.</p><h1>İşte sana özel yorum.</h1><Image className={styles.artwork} src={studioAsset(session.imageUrl)} alt="Yanıtlarına göre AI ile oluşturulan tasarım" width={800} height={800} unoptimized /><p>AI ile oluşturuldu. Şimdi seçtiğin üründe nasıl göründüğüne bak.</p><button className={styles.primary} onClick={() => { rememberSession(session); router.push('/xinobi-u/onizleme'); }}>Ürünümde dene ↗</button><button className={styles.secondary} onClick={restart}>Yeni sorularla keşfet</button></div> : step < 5 ? <>
      <div className={styles.progress}><span>Soru {step + 1} / 5 · {question.axisLabel}</span><button className={styles.freshQuestionsInline} onClick={restart} disabled={busy}>Yeni sorular seç ↻</button></div><div className={styles.progressBar}><span style={{ width: `${(step + 1) * 20}%` }} /></div>
      <fieldset className={styles.question}><legend><h1 ref={heading} tabIndex={-1}>{question.text}</h1></legend><div className={styles.options}>{question.options.map((option, index) => <label key={option.id} className={answers[question.id] === option.id ? styles.chosen : ''}><input type="radio" name={question.id} checked={answers[question.id] === option.id} onChange={() => choose(question.id, option.id)} /><span>{String.fromCharCode(65 + index)}</span><strong>{option.label}</strong><i aria-hidden="true">{answers[question.id] === option.id ? '✓' : '+'}</i></label>)}</div></fieldset>
      <div className={styles.navigation}><button className={styles.secondary} onClick={() => navigateStep(step - 1)} disabled={step === 0}>← Geri</button><button className={styles.primary} onClick={() => navigateStep(step + 1)} disabled={!answers[question.id]}> {step === 4 ? 'Tercihlerimi gör' : 'Devam et'} →</button></div><p className={styles.note}>Doğa, ruh hâli, renk, görsel yoğunluk ve tarz. Her yolculukta yeni sorular, yeni olasılıklar.</p>
    </> : <div className={styles.summary}><p className={styles.kicker}>Tasarım profilin</p><h1 ref={heading} tabIndex={-1}>Birlikte şekillenen beş tercih.</h1><dl>{session.questions.map(q => <div key={q.id}><dt>{q.axisLabel}</dt><dd>{q.options.find(option => option.id === answers[q.id])?.label}</dd></div>)}</dl><p>Yalnızca tasarım tercihlerinin görsel tarifi Cloudflare’a gönderilir. Bu adımda bir AI görseli oluşturulur.</p>{configured === false && <p className={styles.note}>Görsel üretimi şu anda kullanılamıyor. Tercihlerin bu oturumda saklanıyor.</p>}<button className={styles.primary} disabled={!complete || busy || configured !== true} onClick={generate}>{busy ? 'Başlatılıyor…' : 'AI ile tasarımımı oluştur ✦'}</button><button className={styles.secondary} onClick={() => navigateStep(4)}>← Yanıtları düzenle</button></div>}
  </section></div></main>;
}
