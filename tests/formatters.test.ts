import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatCountdown, formatStatus, formatDate, formatLaunchTable } from '../src/cli/formatters.js';
import type { Launch, LaunchStatus } from '../src/types.js';

// Strip ANSI codes for easier assertion
function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

describe('formatCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats a future date as T- countdown', () => {
    vi.setSystemTime(new Date('2026-03-01T10:00:00Z'));
    const result = stripAnsi(formatCountdown('2026-03-01T12:00:00Z'));
    expect(result).toBe('T- 2h');
  });

  it('formats a past date as T+ elapsed', () => {
    vi.setSystemTime(new Date('2026-03-01T14:00:00Z'));
    const result = stripAnsi(formatCountdown('2026-03-01T12:00:00Z'));
    expect(result).toBe('T+ 2h');
  });

  it('includes days when countdown is > 24h', () => {
    vi.setSystemTime(new Date('2026-03-01T10:00:00Z'));
    const result = stripAnsi(formatCountdown('2026-03-04T12:30:00Z'));
    expect(result).toBe('T- 3d 2h 30m');
  });

  it('shows 0s for exact match', () => {
    vi.setSystemTime(new Date('2026-03-01T12:00:00Z'));
    const result = stripAnsi(formatCountdown('2026-03-01T12:00:00Z'));
    expect(result).toBe('T+ 0s');
  });
});

describe('formatStatus', () => {
  it('formats Go status with correct text', () => {
    const status: LaunchStatus = { id: 1, name: 'Go for Launch', abbrev: 'Go' };
    const result = formatStatus(status);
    expect(stripAnsi(result)).toBe('Go for Launch');
  });

  it('formats TBD status in gray', () => {
    const status: LaunchStatus = { id: 2, name: 'To Be Determined', abbrev: 'TBD' };
    const result = formatStatus(status);
    expect(stripAnsi(result)).toBe('To Be Determined');
  });

  it('returns plain text for unknown status', () => {
    const status: LaunchStatus = { id: 99, name: 'Unknown', abbrev: 'UNK' };
    const result = formatStatus(status);
    expect(result).toBe('Unknown');
  });
});

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    const result = formatDate('2026-03-01T12:00:00Z');
    expect(result).toContain('Mar');
    expect(result).toContain('2026');
    expect(result).toContain('12:00');
    expect(result).toContain('UTC');
  });
});

describe('formatLaunchTable', () => {
  function makeLaunch(overrides: Partial<Launch> = {}): Launch {
    return {
      id: 'test-id',
      name: 'Falcon 9 | Starlink',
      slug: 'falcon-9-starlink',
      status: { id: 1, name: 'Go for Launch', abbrev: 'Go' },
      net: '2026-03-01T12:00:00Z',
      windowStart: '2026-03-01T12:00:00Z',
      windowEnd: '2026-03-01T16:00:00Z',
      rocket: { name: 'Falcon 9 Block 5', variant: 'Block 5', family: 'Falcon' },
      pad: { name: 'SLC-40', location: 'Cape Canaveral', latitude: 28.5, longitude: -80.5 },
      mission: { name: 'Starlink Group 1-1', type: 'Communications', description: '', orbit: 'LEO', orbitAbbrev: 'LEO' },
      image: null,
      webcastLive: false,
      program: [],
      ...overrides,
    };
  }

  it('renders a table with launches', () => {
    const result = stripAnsi(formatLaunchTable([makeLaunch()]));
    expect(result).toContain('Date');
    expect(result).toContain('Status');
    expect(result).toContain('Rocket');
    expect(result).toContain('Mission');
    expect(result).toContain('Falcon 9 Block 5');
    expect(result).toContain('Starlink Group 1-1');
    expect(result).toContain('1 upcoming launches');
  });

  it('shows message for empty list', () => {
    const result = stripAnsi(formatLaunchTable([]));
    expect(result).toContain('No upcoming launches found');
  });

  it('uses launch name when mission is null', () => {
    const result = stripAnsi(formatLaunchTable([makeLaunch({ mission: null })]));
    expect(result).toContain('Falcon 9 | Starlink');
  });
});
