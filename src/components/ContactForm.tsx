'use client';
import { useId, useState } from 'react';
import { company } from '@/data/company';
import { Arrow } from './Icons';
import s from './ContactForm.module.css';

type Status = 'idle' | 'sending' | 'ok' | 'error' | 'unconfigured';
const INQ = [
  { v: 'purchase', l: 'רכישת דירה' },
  { v: 'renewal', l: 'התחדשות עירונית' },
  { v: 'other', l: 'פנייה אחרת' },
];
const phoneRe = /^(?:\+?972|0)(?:[23489]|5\d|7\d)\d{7}$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactForm({ project, projects, tone = 'ink', defaultInquiry = 'purchase', layout = 'stack' }: { project?: string; projects?: { id: string; title: string }[]; tone?: 'ink' | 'light'; defaultInquiry?: string; layout?: 'stack' | 'row' }) {
  const id = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [inquiry, setInquiry] = useState(project ? 'purchase' : defaultInquiry);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fallback, setFallback] = useState('');

  function validate(fd: FormData) {
    const e: Record<string, string> = {};
    if (String(fd.get('name') || '').trim().length < 2) e.name = 'נא למלא שם מלא';
    const ph = String(fd.get('phone') || '').replace(/[\s-]/g, '');
    if (!ph) e.phone = 'נא למלא מספר טלפון'; else if (!phoneRe.test(ph)) e.phone = 'מספר הטלפון אינו תקין';
    const em = String(fd.get('email') || '').trim();
    if (em && !emailRe.test(em)) e.email = 'כתובת המייל אינה תקינה';
    if (!fd.get('privacy')) e.privacy = 'יש לאשר את מדיניות הפרטיות';
    return e;
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget; const fd = new FormData(form);
    const e = validate(fd); setErrors(e);
    if (Object.keys(e).length) { form.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`)?.focus(); return; }
    setStatus('sending');
    const data = Object.fromEntries(fd.entries());
    const label = INQ.find((x) => x.v === inquiry)?.l ?? '';
    const body = `שם: ${data.name}\nטלפון: ${data.phone}\nמייל: ${data.email || '-'}\nנושא: ${label}${data.project ? `\nפרויקט: ${data.project}` : ''}\n\n${data.message || ''}`;
    setFallback(`mailto:${company.email}?subject=${encodeURIComponent('פנייה מהאתר — ' + label)}&body=${encodeURIComponent(body)}`);
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...data, inquiry, privacy: !!data.privacy, marketing: !!data.marketing }) });
      if (r.ok) { setStatus('ok'); form.reset(); return; }
      setStatus(r.status === 503 ? 'unconfigured' : 'error');
    } catch { setStatus('error'); }
  }

  if (status === 'ok') {
    return (
      <div className={`${s.done} ${tone === 'light' ? s.light : ''} ${layout === 'row' ? s.doneRow : ''}`} role="status">
        <p className={s.doneTitle}>תודה, הפנייה התקבלה.</p>
        <p>נציג בוני בניין יחזור אליכם בהקדם, בשעות הפעילות.</p>
        <button className="link-arrow" onClick={() => setStatus('idle')}>שליחת פנייה נוספת <Arrow className="" /></button>
      </div>
    );
  }

  const err = (k: string) => errors[k] ? <span className={s.err} id={`${id}-${k}-e`}>{errors[k]}</span> : null;
  const aria = (k: string) => ({ 'aria-invalid': !!errors[k] || undefined, 'aria-describedby': errors[k] ? `${id}-${k}-e` : undefined });

  const failBox = (
    <div aria-live="polite" className={s.live}>
      {(status === 'error' || status === 'unconfigured') && (
        <p className={s.fail} role="alert">
          {status === 'unconfigured' ? 'שליחה מקוונת אינה זמינה כרגע.' : 'השליחה לא הצליחה.'} הפרטים לא נשלחו.
          {' '}אפשר <a href={fallback}>לשלוח אותם במייל</a> או להתקשר ל־<a href={company.phoneShortHref}><bdi dir="ltr">{company.phoneShort}</bdi></a>.
        </p>
      )}
    </div>
  );

  // Low, wide single row (Emerald contact frame): fields right→left, submit at the far left.
  if (layout === 'row') {
    const showProject = !project && inquiry === 'purchase' && !!projects?.length;
    const cols = 4 + (!project && (showProject || inquiry === 'renewal') ? 1 : 0);
    return (
      <form className={`${s.form} ${s.rowForm}`} onSubmit={onSubmit} noValidate>
        <div className={s.rowFields} data-fields style={{ ['--cols' as string]: cols }}>
          <div className={s.field}>
            <label htmlFor={`${id}-name`}>שם מלא <span aria-hidden="true">*</span></label>
            <input id={`${id}-name`} name="name" autoComplete="name" required {...aria('name')} />
            {err('name')}
          </div>
          <div className={s.field}>
            <label htmlFor={`${id}-phone`}>טלפון <span aria-hidden="true">*</span></label>
            <input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required {...aria('phone')} />
            {err('phone')}
          </div>
          <div className={s.field}>
            <label htmlFor={`${id}-email`}>אימייל</label>
            <input id={`${id}-email`} name="email" type="email" autoComplete="email" dir="ltr" {...aria('email')} />
            {err('email')}
          </div>
          <div className={s.field}>
            <label htmlFor={`${id}-inq`}>נושא הפנייה</label>
            <select id={`${id}-inq`} name="inquiry" value={inquiry} onChange={(e) => setInquiry(e.target.value)}>
              {INQ.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>
          {project ? <input type="hidden" name="project" value={project} /> : showProject ? (
            <div className={s.field}>
              <label htmlFor={`${id}-project`}>פרויקט</label>
              <select id={`${id}-project`} name="project" defaultValue="">
                <option value="">עדיין לא בחרתי</option>
                {projects!.map((p) => <option key={p.id} value={p.title}>{p.title}</option>)}
              </select>
            </div>
          ) : inquiry === 'renewal' ? (
            <div className={s.field}>
              <label htmlFor={`${id}-msg`}>כתובת הבניין</label>
              <input id={`${id}-msg`} name="message" autoComplete="street-address" />
            </div>
          ) : null}
          <button type="submit" className={`nx-btn ${s.rowSubmit}`} disabled={status === 'sending'} aria-busy={status === 'sending'}>
            {status === 'sending' ? 'שולחים…' : 'שליחת פנייה'} <Arrow className="" />
          </button>
        </div>
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
        <div className={s.rowConsent} data-fields>
          <label className={s.check}>
            <input type="checkbox" name="privacy" {...aria('privacy')} />
            <span>אני מאשר/ת שמירה ושימוש בפרטיי לצורך מענה לפנייה, בהתאם ל<a href={company.legal.privacy} target="_blank" rel="noopener">מדיניות הפרטיות</a>.</span>
          </label>
          {err('privacy')}
          <label className={s.check}>
            <input type="checkbox" name="marketing" />
            <span>אשמח לקבל עדכונים על פרויקטים בדוא״ל, במסרון או בטלפון. ניתן לבטל בכל עת.</span>
          </label>
        </div>
        {failBox}
      </form>
    );
  }

  return (
    <form className={`${s.form} ${tone === 'light' ? s.light : ''}`} onSubmit={onSubmit} noValidate>
      <fieldset className={s.inq}>
        <legend className={s.legend}>במה נוכל לעזור?</legend>
        <div className={s.chips}>
          {INQ.map((o) => (
            <label key={o.v} className={s.chip}>
              <input type="radio" name="inquiry" value={o.v} checked={inquiry === o.v} onChange={() => setInquiry(o.v)} />
              <span>{o.l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className={s.row}>
        <div className={s.field}>
          <label htmlFor={`${id}-name`}>שם מלא</label>
          <input id={`${id}-name`} name="name" autoComplete="name" required {...aria('name')} />
          {err('name')}
        </div>
        <div className={s.field}>
          <label htmlFor={`${id}-phone`}>טלפון</label>
          <input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required {...aria('phone')} />
          {err('phone')}
        </div>
        <div className={s.field}>
          <label htmlFor={`${id}-email`}>אימייל <span className={s.opt}>(לא חובה)</span></label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" dir="ltr" {...aria('email')} />
          {err('email')}
        </div>
      </div>
      {project ? <input type="hidden" name="project" value={project} /> : inquiry === 'purchase' && projects?.length ? (
        <div className={s.field}>
          <label htmlFor={`${id}-project`}>פרויקט <span className={s.opt}>(לא חובה)</span></label>
          <select id={`${id}-project`} name="project" defaultValue="">
            <option value="">עדיין לא בחרתי</option>
            {projects.map((p) => <option key={p.id} value={p.title}>{p.title}</option>)}
          </select>
        </div>
      ) : null}
      <div className={s.field}>
        <label htmlFor={`${id}-msg`}>{inquiry === 'renewal' ? 'כתובת הבניין ופרטים נוספים' : 'הודעה'} <span className={s.opt}>(לא חובה)</span></label>
        <textarea id={`${id}-msg`} name="message" rows={3} />
      </div>
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
      <div className={s.consent}>
        <label className={s.check}>
          <input type="checkbox" name="privacy" {...aria('privacy')} />
          <span>קראתי ואני מאשר/ת שמירה ושימוש בפרטיי לצורך מענה לפנייה, בהתאם ל<a href={company.legal.privacy} target="_blank" rel="noopener">מדיניות הפרטיות</a>.</span>
        </label>
        {err('privacy')}
        <label className={s.check}>
          <input type="checkbox" name="marketing" />
          <span>אשמח לקבל עדכונים ומידע שיווקי על פרויקטים בדוא״ל, במסרון או בטלפון. ניתן לבטל בכל עת.</span>
        </label>
      </div>
      <div className={s.actions}>
        <button type="submit" className={`btn ${tone === 'ink' ? 'btn--light' : ''}`} disabled={status === 'sending'} aria-busy={status === 'sending'}>
          {status === 'sending' ? 'שולחים…' : 'שליחת פנייה'} <Arrow />
        </button>
        <p className={s.alt}>או בטלפון <a href={company.phoneShortHref}><bdi dir="ltr">{company.phoneShort}</bdi></a></p>
      </div>
      <div aria-live="polite" className={s.live}>
        {(status === 'error' || status === 'unconfigured') && (
          <p className={s.fail} role="alert">
            {status === 'unconfigured' ? 'שליחה מקוונת אינה זמינה כרגע.' : 'השליחה לא הצליחה.'} הפרטים לא נשלחו.
            {' '}אפשר <a href={fallback}>לשלוח אותם במייל</a> או להתקשר ל־<a href={company.phoneShortHref}><bdi dir="ltr">{company.phoneShort}</bdi></a>.
          </p>
        )}
      </div>
    </form>
  );
}
