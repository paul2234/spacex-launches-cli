/**
 * Raw response types from the Launch Library 2 (LL2) API.
 * These match the JSON shape returned by https://ll.thespacedevs.com/2.3.0/
 * Only the fields we actually use are typed here.
 */

export interface LL2PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LL2Launch {
  id: string;
  name: string;
  slug: string;
  status: LL2Status;
  net: string;
  window_start: string;
  window_end: string;
  image: LL2Image | null;
  launch_service_provider: LL2Provider;
  mission: LL2Mission | null;
  rocket: LL2Rocket;
  pad: LL2Pad;
  webcast_live: boolean;
  program: LL2Program[];
}

export interface LL2Provider {
  id: number;
  name: string;
}

export interface LL2Status {
  id: number;
  name: string;
  abbrev: string;
}

export interface LL2Image {
  image_url: string;
}

export interface LL2Mission {
  name: string;
  type: string;
  description: string;
  orbit: LL2Orbit | null;
}

export interface LL2Orbit {
  name: string;
  abbrev: string;
}

export interface LL2Rocket {
  configuration: LL2RocketConfiguration;
}

export interface LL2RocketConfiguration {
  name: string;
  full_name: string;
  variant: string;
  families: LL2Family[];
}

export interface LL2Family {
  name: string;
}

export interface LL2Pad {
  name: string;
  latitude: number;
  longitude: number;
  location: LL2Location;
}

export interface LL2Location {
  name: string;
}

export interface LL2Program {
  name: string;
}
