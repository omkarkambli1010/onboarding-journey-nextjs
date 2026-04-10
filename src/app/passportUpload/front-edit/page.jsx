import { Suspense } from 'react';
import PassportFrontEdit from '@/components/passport-upload/PassportFrontEdit';

// Route: /passportUpload/front-edit
// Figma: 0:38363 — Passport Front editable form
//        Desktop: Onboarding-Web-Passport-Front-Edit (0:37265)

export default function PassportFrontEditPage() {
  return (
    <Suspense fallback={null}>
      <PassportFrontEdit />
    </Suspense>
  );
}
