import { Suspense } from 'react';
import UploadSignature from '@/components/upload-signature/UploadSignature';

export default function UploadSignaturePage() {
  return (
    <Suspense fallback={null}>
      <UploadSignature />
    </Suspense>
  );
}
