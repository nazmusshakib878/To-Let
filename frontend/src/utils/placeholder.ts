/**
 * Generates an SVG house blueprint placeholder data URI with a given accent color,
 * exactly preserving the original visual design of the To-Let application.
 */
export function ph(c: string = '#7fb5a0'): string {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 190">
    <rect width="240" height="190" fill="${c}"/>
    <rect y="140" width="240" height="50" fill="rgba(0,0,0,.12)"/>
    <rect x="150" y="30" width="60" height="70" rx="4" fill="rgba(255,255,255,.7)"/>
    <path d="M180 30v70M150 65h60" stroke="${c}" stroke-width="3"/>
    <rect x="26" y="96" width="100" height="44" rx="6" fill="rgba(255,255,255,.85)"/>
    <rect x="26" y="84" width="30" height="20" rx="5" fill="rgba(255,255,255,1)"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(s)}`;
}
