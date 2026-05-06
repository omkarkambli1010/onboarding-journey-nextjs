import { Suspense } from 'react';
import PassportFront from '@/components/passport-upload/PassportFront';

// Route: /passportUpload/front
// Figma: Onboarding / Passport — Upload Passport Front (node 0:37551)

export default function PassportFrontPage() {
  return (
    <Suspense fallback={null}>
      <PassportFront />
    </Suspense>
  );
}
