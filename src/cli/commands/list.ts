import chalk from 'chalk';
import { getUpcomingLaunches } from '../../client.js';
import { formatLaunchTable } from '../formatters.js';

interface ListOptions {
  limit?: string;
  useLocalTime?: boolean;
}

/**
 * Handler for `spacex list` — show a table of upcoming SpaceX launches.
 */
export async function listCommand(options: ListOptions): Promise<void> {
  try {
    const { launches, updatedAt } = await getUpcomingLaunches();

    // Sort by NET date
    const sorted = [...launches].sort(
      (a, b) => new Date(a.net).getTime() - new Date(b.net).getTime(),
    );

    // Apply limit
    const limit = options.limit ? parseInt(options.limit, 10) : 10;
    if (isNaN(limit) || limit < 1) {
      console.error(chalk.red('\n  Error: --limit must be a positive number\n'));
      process.exit(1);
    }
    const limited = sorted.slice(0, limit);

    console.log('');
    console.log(chalk.bold.cyan('  Upcoming SpaceX Launches'));
    console.log('');
    console.log(formatLaunchTable(limited, options.useLocalTime));
    console.log('');
    console.log(chalk.dim(`  Data updated: ${new Date(updatedAt).toUTCString()}`));
    console.log('');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red(`\n  Error: ${message}\n`));
    process.exit(1);
  }
}
