/**
 * Input Sanitization and XSS Prevention Utility
 * Hardens user inputs, prevents Cross-Site Scripting (XSS), and sanitizes HTML outputs.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

/**
 * Escapes unsafe HTML characters to prevent XSS.
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  const text = String(str);
  return text.replace(/[&<>"'`\/]/g, (char) => HTML_ENTITY_MAP[char] || char);
}

/**
 * Strips script tags, Javascript URI schemes, event handlers, and null bytes.
 */
export function sanitizeInput(input: unknown): string {
  if (input === null || input === undefined) return '';
  let str = String(input);

  // Remove null bytes
  str = str.replace(/\0/g, '');

  // Strip script and iframe tags
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  str = str.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Strip javascript:, data:text/html, vbscript: protocols
  str = str.replace(/javascript\s*:/gi, '');
  str = str.replace(/data\s*:\s*text\/html/gi, '');
  str = str.replace(/vbscript\s*:/gi, '');

  // Strip inline event handlers like onclick=, onerror=
  str = str.replace(/\bon\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  return str.trim();
}

/**
 * Validates and sanitizes reference codes / slugs (e.g. LM-2026-ABC123, insp-001).
 * Strictly permits alphanumeric characters, hyphens, and underscores.
 */
export function sanitizeSlug(slug: unknown): string {
  if (!slug) return '';
  return String(slug).replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64);
}

/**
 * Recursively sanitizes all string fields within an object or array.
 */
export function sanitizeObject<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    return sanitizeInput(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj as T;
  }
  return data;
}
