import chalk from 'chalk';
import { getLaunchById } from '../../client.js';
import { formatLaunchDetail } from '../formatters.js';

interface DetailOptions {
  useLocalTime?: boolean;
}

/**
 * Handler for `spacex detail <id>` — show full details for a specific launch.
 */
export async function detailCommand(id: string, options: DetailOptions = {}): Promise<void> {
  try {
    const launch = await getLaunchById(id);

    if (!launch) {
      console.error(chalk.red(`\n  Error: No launch found with ID or slug "${id}"\n`));
      console.log(chalk.dim('  Tip: Use `spacex list` to see available launches and their IDs.\n'));
      process.exit(1);
    }

    console.log('');
    console.log(chalk.bold.cyan('  Launch Details'));
    console.log(chalk.dim(`  ${'─'.repeat(40)}`));
    console.log('');
    console.log(formatLaunchDetail(launch, options.useLocalTime));
    console.log('');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red(`\n  Error: ${message}\n`));
    process.exit(1);
  }
}
