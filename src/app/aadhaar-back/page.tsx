import { Suspense } from 'react';
import UploadAadhaarBack from '@/components/upload-aadhaar-back/UploadAadhaarBack';

export default function AadhaarBackPage() {
  return (
    <Suspense fallback={null}>
      <UploadAadhaarBack />
    </Suspense>
  );
}
