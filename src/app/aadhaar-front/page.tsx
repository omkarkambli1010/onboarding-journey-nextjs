import { Suspense } from 'react';
import UploadAadhaarFront from '@/components/upload-aadhaar-front/UploadAadhaarFront';

export default function AadhaarFrontPage() {
  return (
    <Suspense fallback={null}>
      <UploadAadhaarFront />
    </Suspense>
  );
}
