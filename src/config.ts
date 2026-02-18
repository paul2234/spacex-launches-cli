/**
 * Configuration constants for the CLI.
 */

/**
 * Base URL for the static JSON data served from GitHub Pages.
 * The pipeline writes upcoming.json here on a schedule.
 * Override with SPACEX_CLI_CDN_URL environment variable for development/testing.
 */
export const CDN_BASE_URL =
  process.env.SPACEX_CLI_CDN_URL ?? 'https://paul2234.github.io/spacex-launches-cli-data';

/**
 * Timeout for CDN fetch requests in milliseconds.
 */
export const FETCH_TIMEOUT_MS = 10_000;
