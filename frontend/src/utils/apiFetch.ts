/**
 * Application-wide HTTP helper: {@link fetchWithTimeout} (15s) + optional timeout toast.
 */
import {
  FETCH_WITH_TIMEOUT_MS,
  fetchWithTimeout,
  type FetchWithTimeoutInit,
} from './fetchWithTimeout';
import type { ToastType } from '../components/ui/Toast';

const TIMEOUT_MESSAGE = 'Server took too long. Try again.';

/** Module-level toast sink mounted once via {@link registerGlobalApiToast} */
let toastSink: ((message: string, type: ToastType) => void) | null = null;

/**
 * Registers the global toast handler from the app shell (typically once).
 * Pass `null` on teardown (e.g. tests / strict mode cleanup).
 */
export function registerGlobalApiToast(
  handler: ((message: string, type: ToastType) => void) | null,
): void {
  toastSink = handler;
}

/** True when {@link fetchWithTimeout} aborted due to the default timeout (not user abort). */
export function isRequestTimeout(err: unknown): boolean {
  return err instanceof Error && err.message.startsWith('Request timed out');
}

/**
 * Drop-in replacement for `fetch`:
 * — 15s timeout (same as {@link FETCH_WITH_TIMEOUT_MS})
 * — on timeout, shows `"Server took too long. Try again."` via {@link registerGlobalApiToast}
 * — rethrows the error so callers can still branch on failures
 */
function isBrowserNetworkError(err: unknown): boolean {
  return (
    err instanceof TypeError &&
    typeof err.message === 'string' &&
    err.message.toLowerCase().includes('fetch')
  );
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: FetchWithTimeoutInit,
): Promise<Response> {
  try {
    return await fetchWithTimeout(input, init);
  } catch (err: unknown) {
    if (isRequestTimeout(err)) {
      toastSink?.(TIMEOUT_MESSAGE, 'error');
      throw err;
    }
    if (isBrowserNetworkError(err)) {
      throw new Error(
        'Cannot reach the FairLens API. Start the backend (uvicorn on port 8000), run the Vite dev server so requests proxy to it, or set VITE_API_BASE_URL to your API URL.',
        { cause: err },
      );
    }
    throw err;
  }
}

/** Re-export for consumers that configure timeouts centrally */
export { FETCH_WITH_TIMEOUT_MS, fetchWithTimeout, type FetchWithTimeoutInit };
