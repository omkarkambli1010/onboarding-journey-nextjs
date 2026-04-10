import { Suspense } from 'react';
import PassportBack from '@/components/passport-upload/PassportBack';

// Route: /passportUpload/back
// Figma: Onboarding / Passport — Upload Passport Back (node 0:36773)

export default function PassportBackPage() {
  return (
    <Suspense fallback={null}>
      <PassportBack />
    </Suspense>
  );
}
