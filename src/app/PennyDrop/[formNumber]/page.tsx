import { Suspense } from 'react';
import PennyDrop from '@/components/penny-drop/PennyDrop';

export default function PennyDropPage() {
  return (
    <Suspense fallback={null}>
      <PennyDrop />
    </Suspense>
  );
}
