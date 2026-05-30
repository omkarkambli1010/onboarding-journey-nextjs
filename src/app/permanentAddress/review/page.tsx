import { Suspense } from 'react';
import PermanentAddressReview from '@/components/permanent-address/PermanentAddressReview';

// Route: /permanentAddress/review
// Screen 3 — Back Document Uploaded + Full Details Review
// Figma: Onboarding-Mob-Document-OCIBack-Uploaded (0:44322)
//        Onboarding-Web-Document-OCIBack-Uploaded (0:44428)

export default function PermanentAddressReviewPage() {
  return (
    <Suspense fallback={null}>
      <PermanentAddressReview />
    </Suspense>
  );
}
