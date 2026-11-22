const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function computeTargetSize(width, height, maxEdge) {
  if (![width, height, maxEdge].every(Number.isFinite) || width <= 0 || height <= 0 || maxEdge <= 0) {
    return { width: 0, height: 0 };
  }

  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function shouldSkipResize({ type, width, height, size }) {
  if (!supportedTypes.has(type)) return true;
  if (![width, height, size].every(Number.isFinite) || width <= 0 || height <= 0 || size < 0) return true;
  return width <= 2600 && height <= 2600 && size < 600 * 1024;
}
