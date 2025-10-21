/**
 * Options for sharing content
 */
export interface ShareOptions {
  /** Title of the shared content */
  title: string;
  /** Description or text of the shared content */
  text: string;
  /** URL to share */
  url: string;
}

/**
 * Shares content using Web Share API or falls back to clipboard copy
 *
 * @param options - Share options (title, text, url)
 * @returns Promise that resolves to true if Web Share API was used, false if clipboard fallback was used
 *
 * @example
 * ```typescript
 * const shared = await shareContent({
 *   title: "마음이음 센터",
 *   text: "정신건강 센터를 확인해보세요",
 *   url: "https://mindconnect.com/centers/1"
 * });
 *
 * if (shared) {
 *   console.log("Shared via Web Share API");
 * } else {
 *   console.log("URL copied to clipboard");
 * }
 * ```
 */
export async function shareContent(options: ShareOptions): Promise<boolean> {
  try {
    // Check if Web Share API is available (primarily mobile browsers)
    if (navigator.share && navigator.canShare && navigator.canShare(options)) {
      await navigator.share(options);
      return true; // Successfully shared via Web Share API
    } else if (navigator.share) {
      // Try without canShare check (for older browsers)
      await navigator.share(options);
      return true;
    }
  } catch (error) {
    // User cancelled share or error occurred
    if ((error as Error).name === 'AbortError') {
      console.log('Share cancelled by user');
      return false;
    }
    console.error('Web Share API failed:', error);
  }

  // Fallback: Copy URL to clipboard
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(options.url);
      return false; // Clipboard fallback used
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = options.url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        return false; // Clipboard fallback used
      } finally {
        document.body.removeChild(textArea);
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generates shareable URL for a center
 *
 * @param centerId - Center ID
 * @returns Full URL (e.g., "https://mindconnect.com/centers/1")
 *
 * @example
 * ```typescript
 * const url = getCenterShareUrl(1);
 * console.log(url); // "https://mindconnect.com/centers/1"
 * ```
 */
export function getCenterShareUrl(centerId: number): string {
  // Get base URL from environment variable or use window.location.origin as fallback
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  // Ensure no trailing slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  return `${cleanBaseUrl}/centers/${centerId}`;
}

/**
 * Creates share options for a center
 *
 * @param centerId - Center ID
 * @param centerName - Name of the center
 * @param description - Optional description of the center
 * @returns ShareOptions object ready to use with shareContent
 *
 * @example
 * ```typescript
 * const shareOptions = createCenterShareOptions(1, "서울시 정신건강복지센터");
 * await shareContent(shareOptions);
 * ```
 */
export function createCenterShareOptions(
  centerId: number,
  centerName: string,
  description?: string
): ShareOptions {
  return {
    title: centerName,
    text: description || `${centerName} - 마음이음`,
    url: getCenterShareUrl(centerId),
  };
}
