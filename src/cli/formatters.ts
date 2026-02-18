import chalk from 'chalk';
import type { Launch, LaunchStatus } from '../types.js';

/**
 * Format a countdown string from now until the given ISO date.
 * Returns e.g. "2d 5h 32m 10s" or "T+ 1h 15m" if in the past.
 */
export function formatCountdown(isoDate: string): string {
  const target = new Date(isoDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    const elapsed = Math.abs(diff);
    return chalk.yellow(`T+ ${formatDuration(elapsed)}`);
  }

  return chalk.green(`T- ${formatDuration(diff)}`);
}

/**
 * Format a duration in milliseconds to a human-readable string.
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0 || parts.length === 0) parts.push(`${seconds % 60}s`);

  return parts.join(' ');
}

/**
 * Colorize a launch status based on its abbreviation.
 */
export function formatStatus(status: LaunchStatus): string {
  switch (status.abbrev) {
    case 'Go':
      return chalk.green.bold(status.name);
    case 'TBC':
      return chalk.yellow(status.name);
    case 'TBD':
      return chalk.gray(status.name);
    case 'Hold':
      return chalk.red(status.name);
    case 'Success':
      return chalk.green(status.name);
    case 'Failure':
      return chalk.red.bold(status.name);
    default:
      return status.name;
  }
}

/**
 * Format a date string for display.
 * Returns e.g. "Feb 18, 2026 at 08:00 UTC"
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
    hour12: false,
  });
}

/**
 * Format a single launch as a detailed card for the "next" and "detail" commands.
 */
export function formatLaunchDetail(launch: Launch): string {
  const lines: string[] = [];

  lines.push(chalk.bold.white(`  ${launch.name}`));
  lines.push('');
  lines.push(`  ${chalk.dim('Status:')}    ${formatStatus(launch.status)}`);
  lines.push(`  ${chalk.dim('NET:')}       ${formatDate(launch.net)}`);
  lines.push(`  ${chalk.dim('Countdown:')} ${formatCountdown(launch.net)}`);
  lines.push(`  ${chalk.dim('Rocket:')}    ${launch.rocket.name}`);
  lines.push(`  ${chalk.dim('Pad:')}       ${launch.pad.name}`);
  lines.push(`  ${chalk.dim('Location:')}  ${launch.pad.location}`);

  if (launch.mission) {
    lines.push('');
    lines.push(`  ${chalk.dim('Mission:')}   ${launch.mission.name}`);
    lines.push(`  ${chalk.dim('Type:')}      ${launch.mission.type}`);
    if (launch.mission.orbit) {
      lines.push(`  ${chalk.dim('Orbit:')}     ${launch.mission.orbit} (${launch.mission.orbitAbbrev})`);
    }
    if (launch.mission.description) {
      lines.push('');
      // Word-wrap description at ~80 chars with indent
      const wrapped = wordWrap(launch.mission.description, 74);
      for (const line of wrapped) {
        lines.push(`  ${chalk.dim(line)}`);
      }
    }
  }

  if (launch.program.length > 0) {
    lines.push('');
    lines.push(`  ${chalk.dim('Program:')}   ${launch.program.join(', ')}`);
  }

  lines.push('');
  lines.push(`  ${chalk.dim('ID:')}        ${launch.id}`);

  return lines.join('\n');
}

/**
 * Format launches as a table for the "list" command.
 */
export function formatLaunchTable(launches: Launch[]): string {
  if (launches.length === 0) {
    return chalk.yellow('  No upcoming launches found.');
  }

  const lines: string[] = [];

  // Header
  const header = `  ${pad('Date', 22)} ${pad('Status', 14)} ${pad('Rocket', 20)} ${'Mission'}`;
  lines.push(chalk.bold.white(header));
  lines.push(chalk.dim(`  ${'─'.repeat(76)}`));

  for (const launch of launches) {
    const date = formatDateShort(launch.net);
    const status = formatStatusShort(launch.status);
    const rocket = launch.rocket.name;
    const mission = launch.mission?.name ?? launch.name;

    lines.push(`  ${pad(date, 22)} ${pad(status, 14)} ${pad(rocket, 20)} ${mission}`);
  }

  lines.push('');
  lines.push(chalk.dim(`  ${launches.length} upcoming launches`));

  return lines.join('\n');
}

/**
 * Short date format for tables: "Feb 18, 08:00 UTC"
 */
function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
    hour12: false,
  });
}

/**
 * Colorized short status for tables.
 */
function formatStatusShort(status: LaunchStatus): string {
  return formatStatus({ ...status, name: status.abbrev });
}

/**
 * Right-pad a string (accounting for ANSI escape codes in length).
 */
function pad(str: string, width: number): string {
  // Strip ANSI codes to calculate visible length
  const visible = str.replace(/\x1b\[[0-9;]*m/g, '');
  const padding = Math.max(0, width - visible.length);
  return str + ' '.repeat(padding);
}

/**
 * Simple word wrap at a given width.
 */
function wordWrap(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (current.length + word.length + 1 > width && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }

  if (current) lines.push(current);
  return lines;
}
