import { Suspense } from 'react';
import PassportUpload from '@/components/passport-upload/PassportUpload';

// Route: /passportUpload
// Figma: Onboarding / Step 10 / Passport Proof - Document Upload (node 0:35318)

export default function PassportUploadPage() {
  return (
    <Suspense fallback={null}>
      <PassportUpload />
    </Suspense>
  );
}
