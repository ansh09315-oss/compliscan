/**
 * Client-side SHA-256 hash generation using Web Crypto API
 * Ensures Section 63 BSA 2023 evidentiary integrity
 */

export async function computeSHA256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function computeSHA256FromString(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return computeSHA256(data.buffer as ArrayBuffer);
}

export function dataUrlToBlob(dataUrl: string): Blob {
  try {
    if (dataUrl.startsWith('data:')) {
      const parts = dataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const binary = atob(parts[1]);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      return new Blob([array], { type: mime });
    }
  } catch (err) {
    console.warn('[cryptoUtils] Base64 decode failed, using empty blob:', err);
  }
  return new Blob([], { type: 'image/jpeg' });
}

export async function computeSHA256FromBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  return computeSHA256(buffer);
}

export async function computeSHA256FromDataUrl(dataUrl: string): Promise<string> {
  if (dataUrl.startsWith('data:')) {
    const blob = dataUrlToBlob(dataUrl);
    return computeSHA256FromBlob(blob);
  }
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return computeSHA256FromBlob(blob);
}

/**
 * Generate a master hash combining all image hashes for the dossier
 */
export async function computeMasterHash(imageHashes: string[]): Promise<string> {
  const combined = imageHashes.sort().join('|');
  return computeSHA256FromString(combined);
}

/**
 * Generate a simulated device hardware ID
 */
export function getDeviceHardwareId(): string {
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  if (!nav) return 'SERVER-SIDE-NO-DEVICE';
  const parts = [
    nav.platform || 'unknown',
    nav.language || 'en',
    screen?.width || 0,
    screen?.height || 0,
    nav.hardwareConcurrency || 1,
  ];
  return `DEV-${btoa(parts.join('-')).substring(0, 16).toUpperCase()}`;
}

/**
 * Generate a dossier reference code in format LM-YYYY-XXXXXX
 */
export function generateDossierCode(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(100000 + Math.random() * 900000);
  return `LM-${year}-${seq}`;
}

/**
 * Get current geolocation (returns null if unavailable)
 */
export function getCurrentGeoLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}
