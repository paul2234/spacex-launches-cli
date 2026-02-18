import chalk from 'chalk';
import { getUpcomingLaunches } from '../../client.js';
import { formatLaunchDetail } from '../formatters.js';

interface NextOptions {
  useLocalTime?: boolean;
}

/**
 * Handler for `spacex next` — show the next upcoming SpaceX launch with countdown.
 */
export async function nextCommand(options: NextOptions = {}): Promise<void> {
  try {
    const { launches, updatedAt } = await getUpcomingLaunches();

    if (launches.length === 0) {
      console.log(chalk.yellow('\n  No upcoming SpaceX launches found.\n'));
      return;
    }

    // Launches should already be sorted by NET, but ensure it
    const sorted = [...launches].sort(
      (a, b) => new Date(a.net).getTime() - new Date(b.net).getTime(),
    );

    const next = sorted[0];

    console.log('');
    console.log(chalk.bold.cyan('  Next SpaceX Launch'));
    console.log(chalk.dim(`  ${'─'.repeat(40)}`));
    console.log('');
    console.log(formatLaunchDetail(next, options.useLocalTime));
    console.log('');
    console.log(chalk.dim(`  Data updated: ${new Date(updatedAt).toUTCString()}`));
    console.log('');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red(`\n  Error: ${message}\n`));
    process.exit(1);
  }
}
