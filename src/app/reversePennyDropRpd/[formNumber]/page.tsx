import { Suspense } from 'react';
import Rpd from '@/components/rpd/Rpd';

export default function ReversePennyDropRpdPage() {
  return (
    <Suspense fallback={null}>
      <Rpd />
    </Suspense>
  );
}
