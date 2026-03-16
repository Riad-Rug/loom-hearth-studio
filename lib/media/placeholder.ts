function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function createPlaceholderDataUrl(label: string) {
  const safeLabel = escapeSvgText(label);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="${safeLabel}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f6eee3" />
          <stop offset="100%" stop-color="#e0c9b5" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)" />
      <circle cx="960" cy="180" r="220" fill="rgba(184,94,59,0.18)" />
      <circle cx="210" cy="720" r="180" fill="rgba(34,33,38,0.07)" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b6258" font-size="42" font-family="Arial, sans-serif" letter-spacing="2">${safeLabel}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
