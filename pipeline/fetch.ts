import type { LL2Launch, LL2PaginatedResponse } from './api-types.js';
import { LL2_API_BASE, SPACEX_PROVIDER_ID, MAX_LAUNCHES } from './config.js';

/**
 * Fetch all upcoming SpaceX launches from the LL2 API, handling pagination.
 */
export async function fetchUpcomingLaunches(): Promise<LL2Launch[]> {
  const launches: LL2Launch[] = [];
  const limit = 100; // Max per page
  let url: string | null =
    `${LL2_API_BASE}/launches/upcoming/?launch_service_provider__id=${SPACEX_PROVIDER_ID}&limit=${limit}&format=json`;

  while (url && launches.length < MAX_LAUNCHES) {
    console.log(`  Fetching: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`LL2 API returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as LL2PaginatedResponse<LL2Launch>;
    launches.push(...data.results);

    url = data.next;

    // Be polite with rate limits — wait between paginated requests
    if (url) {
      await sleep(1000);
    }
  }

  return launches.slice(0, MAX_LAUNCHES);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
