// asset() — prefix a public/static path with the deploy basePath.
//
// Next.js auto-prefixes `basePath`/`assetPrefix` for next/image (<Image>),
// next/link, and the router. Raw references it does NOT touch — e.g. plain
// <img src=`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/...`>, inline style background-image url(), new Image(),
// and direct window.location assignments. Wrap those with asset() so they
// resolve correctly when the app is served under a sub-path (e.g. /diynri).
//
// IMPORTANT: do NOT wrap <Image> (next/image) srcs with this — they are already
// prefixed by Next and would become /diynri/diynri/... (double prefix).
//
// Pass an app-absolute path beginning with "/". Returns it unchanged when no
// basePath is configured (local dev / root deploy).
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(path: string): string {
  if (!path.startsWith('/')) return path;
  // Avoid accidental double-prefix if a caller passes an already-prefixed path.
  if (BASE_PATH && path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}

export default asset;
