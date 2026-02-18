import { describe, it, expect } from 'vitest';
import { transformLaunches } from '../pipeline/transform.js';
import type { LL2Launch } from '../pipeline/api-types.js';

function makeLaunch(overrides: Partial<LL2Launch> = {}): LL2Launch {
  return {
    id: 'test-id-123',
    name: 'Falcon 9 Block 5 | Starlink Group 1-1',
    slug: 'falcon-9-block-5-starlink-group-1-1',
    status: { id: 1, name: 'Go for Launch', abbrev: 'Go' },
    net: '2026-03-01T12:00:00Z',
    window_start: '2026-03-01T12:00:00Z',
    window_end: '2026-03-01T16:00:00Z',
    image: { image_url: 'https://example.com/image.jpg' },
    launch_service_provider: { id: 121, name: 'SpaceX' },
    mission: {
      name: 'Starlink Group 1-1',
      type: 'Communications',
      description: 'A batch of Starlink satellites.',
      orbit: { name: 'Low Earth Orbit', abbrev: 'LEO' },
    },
    rocket: {
      configuration: {
        name: 'Falcon 9',
        full_name: 'Falcon 9 Block 5',
        variant: 'Block 5',
        families: [{ name: 'Falcon' }, { name: 'Falcon 9' }],
      },
    },
    pad: {
      name: 'Space Launch Complex 40',
      latitude: 28.562,
      longitude: -80.577,
      location: { name: 'Cape Canaveral SFS, FL, USA' },
    },
    webcast_live: false,
    program: [{ name: 'Starlink' }],
    ...overrides,
  };
}

describe('transformLaunches', () => {
  it('transforms a basic launch correctly', () => {
    const result = transformLaunches([makeLaunch()]);

    expect(result.launches).toHaveLength(1);
    expect(result.updatedAt).toBeDefined();

    const launch = result.launches[0];
    expect(launch.id).toBe('test-id-123');
    expect(launch.name).toBe('Falcon 9 Block 5 | Starlink Group 1-1');
    expect(launch.slug).toBe('falcon-9-block-5-starlink-group-1-1');
    expect(launch.status.abbrev).toBe('Go');
    expect(launch.rocket.name).toBe('Falcon 9 Block 5');
    expect(launch.rocket.family).toBe('Falcon');
    expect(launch.pad.name).toBe('Space Launch Complex 40');
    expect(launch.pad.location).toBe('Cape Canaveral SFS, FL, USA');
    expect(launch.mission?.name).toBe('Starlink Group 1-1');
    expect(launch.mission?.orbit).toBe('Low Earth Orbit');
    expect(launch.mission?.orbitAbbrev).toBe('LEO');
    expect(launch.image).toBe('https://example.com/image.jpg');
    expect(launch.program).toEqual(['Starlink']);
  });

  it('filters out non-SpaceX launches', () => {
    const spacex = makeLaunch();
    const notSpacex = makeLaunch({
      id: 'other-id',
      launch_service_provider: { id: 999, name: 'Firefly Aerospace' },
    });

    const result = transformLaunches([spacex, notSpacex]);
    expect(result.launches).toHaveLength(1);
    expect(result.launches[0].id).toBe('test-id-123');
  });

  it('handles null mission', () => {
    const launch = makeLaunch({ mission: null });
    const result = transformLaunches([launch]);
    expect(result.launches[0].mission).toBeNull();
  });

  it('handles null image', () => {
    const launch = makeLaunch({ image: null });
    const result = transformLaunches([launch]);
    expect(result.launches[0].image).toBeNull();
  });

  it('handles mission with null orbit', () => {
    const launch = makeLaunch({
      mission: {
        name: 'Test',
        type: 'Science',
        description: 'A test mission',
        orbit: null,
      },
    });
    const result = transformLaunches([launch]);
    expect(result.launches[0].mission?.orbit).toBeNull();
    expect(result.launches[0].mission?.orbitAbbrev).toBeNull();
  });

  it('sorts launches by NET date', () => {
    const early = makeLaunch({ id: 'early', net: '2026-01-01T00:00:00Z' });
    const late = makeLaunch({ id: 'late', net: '2026-06-01T00:00:00Z' });
    const mid = makeLaunch({ id: 'mid', net: '2026-03-01T00:00:00Z' });

    const result = transformLaunches([late, early, mid]);
    expect(result.launches.map((l) => l.id)).toEqual(['early', 'mid', 'late']);
  });

  it('handles empty programs array', () => {
    const launch = makeLaunch({ program: [] });
    const result = transformLaunches([launch]);
    expect(result.launches[0].program).toEqual([]);
  });

  it('handles empty input', () => {
    const result = transformLaunches([]);
    expect(result.launches).toHaveLength(0);
    expect(result.updatedAt).toBeDefined();
  });
});
