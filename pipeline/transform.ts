import type { LL2Launch } from './api-types.js';
import type { Launch, UpcomingLaunchesResponse } from '../src/types.js';
import { SPACEX_PROVIDER_ID } from './config.js';

/**
 * Transform an array of raw LL2 launches into the domain format
 * used by the CLI. Filters to only SpaceX launches (provider ID 121)
 * since the API filter can sometimes include tangentially related launches.
 */
export function transformLaunches(raw: LL2Launch[]): UpcomingLaunchesResponse {
  const launches = raw
    .filter((l) => l.launch_service_provider.id === SPACEX_PROVIDER_ID)
    .map(transformLaunch)
    .sort((a, b) => new Date(a.net).getTime() - new Date(b.net).getTime());

  return {
    launches,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Transform a single LL2 launch into the flat domain type.
 */
function transformLaunch(raw: LL2Launch): Launch {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    status: {
      id: raw.status.id,
      name: raw.status.name,
      abbrev: raw.status.abbrev,
    },
    net: raw.net,
    windowStart: raw.window_start,
    windowEnd: raw.window_end,
    image: raw.image?.image_url ?? null,
    webcastLive: raw.webcast_live,
    mission: raw.mission
      ? {
          name: raw.mission.name,
          type: raw.mission.type,
          description: raw.mission.description,
          orbit: raw.mission.orbit?.name ?? null,
          orbitAbbrev: raw.mission.orbit?.abbrev ?? null,
        }
      : null,
    rocket: {
      name: raw.rocket.configuration.full_name,
      variant: raw.rocket.configuration.variant,
      family: raw.rocket.configuration.families?.[0]?.name ?? raw.rocket.configuration.name,
    },
    pad: {
      name: raw.pad.name,
      location: raw.pad.location.name,
      latitude: raw.pad.latitude,
      longitude: raw.pad.longitude,
    },
    program: raw.program.map((p) => p.name),
  };
}
