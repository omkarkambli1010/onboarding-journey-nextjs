import { Suspense } from 'react';
import OciBack from '@/components/oci/OciBack';

// Route: /oci/back
// Figma: Onboarding-Mob-OCI/PIO-Upload-Back (0:40478)
//        Onboarding-Web-OCI/PIO-Upload-Back (0:40567)

export default function OciBackPage() {
  return (
    <Suspense fallback={null}>
      <OciBack />
    </Suspense>
  );
}
