// Module-level transfer slots for the OCI/PIO front + back pages picked in
// the upload sheet and consumed by OciFront / OciBack. Survives client-side
// navigation (same JS bundle); never persisted — a hard reload clears it.
//
// Mirrors passport-upload/passportStore. The store owns each file's objectURL
// lifecycle: `set` revokes the URL it replaces and creates a fresh one;
// `clear` revokes on the way out.

export interface OciFile {
  name: string;
  blob: Blob;
  objectUrl: string;
  type: string;
  size: number;
}

export type OciSide = 'front' | 'back';

const slots: Record<OciSide, OciFile | null> = {
  front: null,
  back: null,
};

export const ociStore = {
  // Stores `blob` for `side`, creating a fresh objectURL. Any file already in
  // that slot has its objectURL revoked first.
  set(side: OciSide, input: { name: string; blob: Blob; type: string }): OciFile {
    const prev = slots[side];
    if (prev) URL.revokeObjectURL(prev.objectUrl);
    const file: OciFile = {
      name: input.name,
      blob: input.blob,
      objectUrl: URL.createObjectURL(input.blob),
      type: input.type || input.blob.type,
      size: input.blob.size,
    };
    slots[side] = file;
    return file;
  },

  // Non-clearing read — preview screens call this, so the slot keeps its value
  // and back-navigation within the session still shows the file.
  get(side: OciSide): OciFile | null {
    return slots[side];
  },

  // Revokes and clears one side, or both when `side` is omitted.
  clear(side?: OciSide): void {
    const sides: OciSide[] = side ? [side] : ['front', 'back'];
    for (const s of sides) {
      const f = slots[s];
      if (f) URL.revokeObjectURL(f.objectUrl);
      slots[s] = null;
    }
  },
};
