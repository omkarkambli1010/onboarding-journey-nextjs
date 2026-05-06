import { Suspense } from 'react';
import PassportUploadSheet from '@/components/passport-upload/PassportUploadSheet';

// Route: /passportUpload/upload-back
// Figma: Onboarding-Mob-Passport-Upload (0:38143) — camera/file pick bottom sheet
//        Onboarding-Mob-Passport-Upload-Front (0:37918) — progress state (reused for back)

export default function PassportUploadBackPage() {
  return (
    <Suspense fallback={null}>
      <PassportUploadSheet side="back" />
    </Suspense>
  );
}
