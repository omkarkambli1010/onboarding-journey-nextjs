import { Suspense } from 'react';
import PassportUploadSheet from '@/components/passport-upload/PassportUploadSheet';

// Route: /passportUpload/upload-front
// Figma: Onboarding-Mob-Passport-Upload (0:38143) — camera/file pick bottom sheet
//        Onboarding-Mob-Passport-Upload-Front (0:37918) — progress state

export default function PassportUploadFrontPage() {
  return (
    <Suspense fallback={null}>
      <PassportUploadSheet side="front" />
    </Suspense>
  );
}
