/**
 * Pipeline configuration constants.
 */

/**
 * SpaceDevs Launch Library 2 API base URL.
 * Dev API has higher rate limits (300/hr vs 15/hr).
 */
export const LL2_API_BASE =
  process.env.LL2_API_URL ?? 'https://lldev.thespacedevs.com/2.3.0';

/**
 * SpaceX launch service provider ID in the LL2 database.
 */
export const SPACEX_PROVIDER_ID = 121;

/**
 * Output directory for generated JSON files.
 */
export const OUTPUT_DIR = process.env.OUTPUT_DIR ?? 'data';

/**
 * Maximum number of launches to fetch (across all pages).
 */
export const MAX_LAUNCHES = 200;
