import { Suspense } from 'react';
import UploadAdditional from '@/components/upload-additional/UploadAdditional';

export default function AdditionalDocumentPage() {
  return (
    <Suspense fallback={null}>
      <UploadAdditional />
    </Suspense>
  );
}
