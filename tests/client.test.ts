import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { UpcomingLaunchesResponse } from '../src/types.js';

const mockData: UpcomingLaunchesResponse = {
  launches: [
    {
      id: 'test-123',
      name: 'Falcon 9 | Test Mission',
      slug: 'falcon-9-test-mission',
      status: { id: 1, name: 'Go for Launch', abbrev: 'Go' },
      net: '2026-03-01T12:00:00Z',
      windowStart: '2026-03-01T12:00:00Z',
      windowEnd: '2026-03-01T16:00:00Z',
      rocket: { name: 'Falcon 9 Block 5', variant: 'Block 5', family: 'Falcon' },
      pad: { name: 'SLC-40', location: 'Cape Canaveral', latitude: 28.5, longitude: -80.5 },
      mission: {
        name: 'Test Mission',
        type: 'Communications',
        description: 'Test',
        orbit: 'LEO',
        orbitAbbrev: 'LEO',
      },
      image: null,
      webcastLive: false,
      program: [],
    },
  ],
  updatedAt: '2026-02-18T00:00:00Z',
};

describe('client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.resetModules();
    // Set CDN URL before importing client
    process.env.SPACEX_CLI_CDN_URL = 'https://test-cdn.example.com';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.SPACEX_CLI_CDN_URL;
  });

  it('getUpcomingLaunches fetches from CDN and returns data', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { getUpcomingLaunches } = await import('../src/client.js');
    const result = await getUpcomingLaunches();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://test-cdn.example.com/upcoming.json',
      expect.any(Object),
    );
    expect(result.launches).toHaveLength(1);
    expect(result.launches[0].id).toBe('test-123');
  });

  it('getUpcomingLaunches throws on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const { getUpcomingLaunches } = await import('../src/client.js');
    await expect(getUpcomingLaunches()).rejects.toThrow('Failed to fetch launch data (HTTP 404)');
  });

  it('getLaunchById finds launch by ID', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { getLaunchById } = await import('../src/client.js');
    const result = await getLaunchById('test-123');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('test-123');
  });

  it('getLaunchById finds launch by slug', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { getLaunchById } = await import('../src/client.js');
    const result = await getLaunchById('falcon-9-test-mission');

    expect(result).not.toBeNull();
    expect(result!.slug).toBe('falcon-9-test-mission');
  });

  it('getLaunchById returns null for unknown ID', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { getLaunchById } = await import('../src/client.js');
    const result = await getLaunchById('nonexistent');

    expect(result).toBeNull();
  });
});
