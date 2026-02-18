import { Command } from 'commander';
import { nextCommand } from './commands/next.js';
import { listCommand } from './commands/list.js';
import { detailCommand } from './commands/detail.js';

const program = new Command();

program
  .name('spacex')
  .description('Track upcoming SpaceX launches from the command line')
  .version('0.1.0');

program
  .command('next')
  .description('Show the next upcoming SpaceX launch with countdown')
  .action(nextCommand);

program
  .command('list')
  .description('List upcoming SpaceX launches')
  .option('-l, --limit <number>', 'Number of launches to show', '10')
  .action(listCommand);

program
  .command('detail')
  .description('Show full details for a specific launch')
  .argument('<id>', 'Launch ID or slug')
  .action(detailCommand);

program.parse();
