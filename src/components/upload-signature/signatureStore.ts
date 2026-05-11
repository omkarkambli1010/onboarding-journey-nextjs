// Module-level transfer slot for a signature file picked on one route and
// consumed on another (e.g. picked in the modal on /uploadSignatureinfo and
// shown in the verify state on /uploadSignature). Survives client-side
// navigation because the JS bundle is the same; never persisted.

export interface PendingSignature {
  name: string;
  dataUrl: string;
  type: string;
  size: number;
}

let pending: PendingSignature | null = null;

export const signatureStore = {
  get(): PendingSignature | null {
    return pending;
  },
  take(): PendingSignature | null {
    const v = pending;
    pending = null;
    return v;
  },
  set(next: PendingSignature): void {
    pending = next;
  },
  clear(): void {
    pending = null;
  },
};
