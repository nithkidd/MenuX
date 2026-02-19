/**
 * Detects if the given text contains Khmer characters.
 * range: U+1780 - U+17FF (Khmer), U+19E0 - U+19FF (Khmer Symbols)
 */
export function isKhmer(text?: string | null): boolean {
  if (!text) return false;
  const khmerPattern = /[\u1780-\u17FF\u19E0-\u19FF]/;
  return khmerPattern.test(text);
}

/**
 * Returns the appropriate font class based on the text content or selected language.
 * Prefer 'font-khmer' if the text contains Khmer characters.
 * If text is present but NOT Khmer, force 'font-english' (to avoid using Khmer font for English text in Khmer mode).
 */
export function getFontClass(text?: string | null, fallbackClass: string = 'font-english'): string {
  if (!text) return fallbackClass;
  
  if (isKhmer(text)) {
    return 'font-khmer';
  }
  
  return 'font-english';
}
