import { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';

// Transient failures worth retrying (e.g. a Render free-tier cold start on the
// first hit):
//   - connection-level errors where no HTTP response came back at all:
//     timeout (ECONNABORTED), connection reset, DNS/network failure;
//   - gateway responses Render returns while the service spins up: 502/503/504.
// Any OTHER server response (all other 4xx/5xx) is NOT retried — it surfaces
// immediately, exactly as before.
const RETRYABLE_STATUS = new Set([502, 503, 504]);
const isRetryable = (e) => !e?.response || RETRYABLE_STATUS.has(e.response.status);

const RETRY_ATTEMPTS = 2; // extra attempts after the first (3 total)
const RETRY_BASE_MS = 600; // short linear backoff: 600ms, then 1200ms
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Minimal GET-and-render helper for the storefront pages.
export default function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        const res = await api.get(url);
        setData(res.data);
        setError(null);
        setLoading(false);
        return;
      } catch (e) {
        // Retry transient connection/gateway failures; fail fast on genuine
        // server responses so real errors show right away.
        if (isRetryable(e) && attempt < RETRY_ATTEMPTS) {
          await delay(RETRY_BASE_MS * (attempt + 1));
          continue;
        }
        setError(e.response?.data?.message || 'Something went wrong');
        setLoading(false);
        return;
      }
    }
  }, [url]);

  useEffect(() => {
    if (url) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch };
}
