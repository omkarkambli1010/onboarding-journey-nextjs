import { Suspense } from 'react';
import OciFront from '@/components/oci/OciFront';

// Route: /oci/front
// Figma: Onboarding-Mob-OCI/PIO-Upload-Front (0:40145)
//        Onboarding-Web-OCI/PIO-Upload-Front (0:40234)

export default function OciFrontPage() {
  return (
    <Suspense fallback={null}>
      <OciFront />
    </Suspense>
  );
}
