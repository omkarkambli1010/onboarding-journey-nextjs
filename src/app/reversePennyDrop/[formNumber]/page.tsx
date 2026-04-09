import { Suspense } from 'react';
import ReversePennyDrop from '@/components/reverse-penny-drop/ReversePennyDrop';

export default function ReversePennyDropPage() {
  return (
    <Suspense fallback={null}>
      <ReversePennyDrop />
    </Suspense>
  );
}
