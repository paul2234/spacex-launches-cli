import { CDN_BASE_URL, FETCH_TIMEOUT_MS } from './config.js';
import type { Launch, UpcomingLaunchesResponse } from './types.js';

/**
 * Fetch all upcoming SpaceX launches from the CDN.
 */
export async function getUpcomingLaunches(): Promise<UpcomingLaunchesResponse> {
  const url = `${CDN_BASE_URL}/upcoming.json`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch launch data (HTTP ${response.status})`);
  }

  return response.json() as Promise<UpcomingLaunchesResponse>;
}

/**
 * Fetch a single launch by ID from the CDN.
 * Falls back to searching the upcoming launches list if individual files aren't available.
 */
export async function getLaunchById(id: string): Promise<Launch | null> {
  // First, try the upcoming launches list
  const { launches } = await getUpcomingLaunches();
  const launch = launches.find((l) => l.id === id || l.slug === id);
  return launch ?? null;
}

/**
 * Fetch with a timeout to avoid hanging on slow/dead CDN responses.
 */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
