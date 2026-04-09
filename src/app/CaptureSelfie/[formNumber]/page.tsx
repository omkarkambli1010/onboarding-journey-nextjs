import { Suspense } from 'react';
import Selfie from '@/components/selfie/Selfie';

export default function CaptureSelfie() {
  return (
    <Suspense fallback={null}>
      <Selfie />
    </Suspense>
  );
}
