import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Return type for useClipboard hook
 */
export interface UseClipboardReturn {
  /** Whether the text was recently copied */
  copied: boolean;
  /** Copy text to clipboard */
  copy: (text: string) => Promise<void>;
  /** Manually reset the copied state */
  reset: () => void;
}

/**
 * Hook for copying text to clipboard with success state management
 *
 * @param duration - Duration to show success state in milliseconds (default: 2000)
 * @returns Object with copied state, copy function, and reset function
 *
 * @example
 * ```typescript
 * const { copied, copy } = useClipboard();
 *
 * const handleCopy = async () => {
 *   await copy("Hello World");
 *   if (copied) {
 *     console.log("Copied successfully!");
 *   }
 * };
 * ```
 */
export function useClipboard(duration: number = 2000): UseClipboardReturn {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Copy text to clipboard
   */
  const copy = useCallback(async (text: string): Promise<void> => {
    try {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Check if Clipboard API is supported
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);

        // Auto-reset after duration
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, duration);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          setCopied(true);

          // Auto-reset after duration
          timeoutRef.current = setTimeout(() => {
            setCopied(false);
          }, duration);
        } catch (err) {
          console.error('Failed to copy using fallback method:', err);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setCopied(false);
    }
  }, [duration]);

  /**
   * Manually reset the copied state
   */
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCopied(false);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copied, copy, reset };
}
