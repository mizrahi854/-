'use client';
import BuildScene from '../nx/BuildScene';
import { renewalStages } from '@/data/company';

/** Urban-renewal instance of the shared frame-to-home scene. */
export default function RenewalProcess() {
  return (
    <BuildScene id="ur-process" kicker="STEP BY STEP" plainTitle="התהליך שלנו" stages={renewalStages}
      cta={{ title: 'מתחילים בבדיקה.', text: 'השאירו את כתובת הבניין, ונציג מחטיבת ההתחדשות העירונית יחזור אליכם.', label: 'לבדיקת הבניין', href: '#renewal-contact' }} />
  );
}
