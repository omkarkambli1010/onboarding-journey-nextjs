import { Suspense } from 'react';
import PermanentAddressFrontUploaded from '@/components/permanent-address/PermanentAddressFrontUploaded';

// Route: /permanentAddress/step-1
// Screen 2 — Front Document Uploaded (file chip + image preview + extracted address)
// Figma: Onboarding-Mob-PermanentAddress-Noselection (0:43330)
//        Onboarding-Web-PermanentAddress-Noselection (0:43428)

export default function PermanentAddressStep1Page() {
  return (
    <Suspense fallback={null}>
      <PermanentAddressFrontUploaded />
    </Suspense>
  );
}
