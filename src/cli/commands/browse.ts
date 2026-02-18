import chalk from "chalk";
import { getUpcomingLaunches } from "../../client.js";
import { startApp } from "../tui/app.js";

interface BrowseOptions {
  useLocalTime?: boolean;
}

/**
 * Handler for `spacex-launches browse` — interactively browse upcoming launches.
 */
export async function browseCommand(
  options: BrowseOptions = {},
): Promise<void> {
  try {
    // Show loading message before entering the TUI
    process.stdout.write(chalk.dim("\n  Loading launch data...\n"));

    const { launches } = await getUpcomingLaunches();

    if (launches.length === 0) {
      console.log(chalk.yellow("\n  No upcoming SpaceX launches found.\n"));
      return;
    }

    // Sort by NET date
    const sorted = [...launches].sort(
      (a, b) => new Date(a.net).getTime() - new Date(b.net).getTime(),
    );

    await startApp(sorted, options.useLocalTime ?? false);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(chalk.red(`\n  Error: ${message}\n`));
    process.exit(1);
  }
}
