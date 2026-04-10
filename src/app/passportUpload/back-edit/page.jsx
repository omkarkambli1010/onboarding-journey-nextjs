import { Suspense } from 'react';
import PassportBackEdit from '@/components/passport-upload/PassportBackEdit';

// Route: /passportUpload/back-edit
// Figma: 0:36878 — Onboarding-Mob-Passport-Back-Edit
//        Desktop: Onboarding-Web-Passport-Back-Edit (0:36487)

export default function PassportBackEditPage() {
  return (
    <Suspense fallback={null}>
      <PassportBackEdit />
    </Suspense>
  );
}
