export const SINAI_FONT_SIZE_KEY = "sinai-font-size";

export const SINAI_FONT_SIZES = ["small", "medium", "large"] as const;

export type SinaiFontSize = (typeof SINAI_FONT_SIZES)[number];

export const SINAI_FONT_SIZE_DEFAULT: SinaiFontSize = "medium";

export function isSinaiFontSize(value: string | null | undefined): value is SinaiFontSize {
  return SINAI_FONT_SIZES.includes(value as SinaiFontSize);
}

export function applySinaiFontSize(size: SinaiFontSize) {
  document.documentElement.dataset.sinaiFontSize = size;
}

export function readStoredSinaiFontSize(): SinaiFontSize {
  try {
    const stored = localStorage.getItem(SINAI_FONT_SIZE_KEY);
    return isSinaiFontSize(stored) ? stored : SINAI_FONT_SIZE_DEFAULT;
  } catch {
    return SINAI_FONT_SIZE_DEFAULT;
  }
}

export function persistSinaiFontSize(size: SinaiFontSize) {
  applySinaiFontSize(size);
  try {
    localStorage.setItem(SINAI_FONT_SIZE_KEY, size);
  } catch {
    // Ignore storage failures (private mode, quotas, etc.).
  }
}

/** Inline script to apply the stored size before paint and avoid a flash. */
export const SINAI_FONT_SIZE_BOOTSTRAP = `(function(){try{var k=${JSON.stringify(SINAI_FONT_SIZE_KEY)};var v=localStorage.getItem(k);if(v==="small"||v==="medium"||v==="large"){document.documentElement.dataset.sinaiFontSize=v;}}catch(e){}})();`;
