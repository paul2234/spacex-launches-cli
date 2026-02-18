/**
 * Domain types for SpaceX launch data.
 * These are flattened from the deeply nested Launch Library 2 API responses.
 * The data pipeline transforms raw API data into these shapes before writing to the CDN.
 * The CLI consumes these types directly.
 */

export interface Launch {
  id: string;
  name: string;
  slug: string;
  status: LaunchStatus;
  net: string; // ISO 8601 date — "No Earlier Than" launch time
  windowStart: string; // ISO 8601
  windowEnd: string; // ISO 8601
  mission: Mission | null;
  rocket: Rocket;
  pad: Pad;
  image: string | null; // URL to launch image
  webcastLive: boolean;
  program: string[]; // e.g. ["Starlink", "ISS"]
}

export interface LaunchStatus {
  id: number;
  name: string; // e.g. "Go for Launch", "TBD", "To Be Confirmed"
  abbrev: string; // e.g. "Go", "TBD", "TBC"
}

export interface Mission {
  name: string;
  type: string; // e.g. "Communications", "Crew"
  description: string;
  orbit: string | null; // e.g. "Low Earth Orbit"
  orbitAbbrev: string | null; // e.g. "LEO"
}

export interface Rocket {
  name: string; // e.g. "Falcon 9 Block 5"
  variant: string; // e.g. "Block 5"
  family: string; // e.g. "Falcon 9"
}

export interface Pad {
  name: string; // e.g. "Space Launch Complex 40"
  location: string; // e.g. "Cape Canaveral SFS, FL, USA"
  latitude: number;
  longitude: number;
}

/**
 * The shape of the upcoming.json file served from the CDN.
 */
export interface UpcomingLaunchesResponse {
  launches: Launch[];
  updatedAt: string; // ISO 8601 — when the pipeline last ran
}
