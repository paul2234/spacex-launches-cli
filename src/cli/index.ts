import { Command } from 'commander';
import { nextCommand } from './commands/next.js';
import { listCommand } from './commands/list.js';
import { detailCommand } from './commands/detail.js';

const program = new Command();

program
  .name('spacex')
  .description('Track upcoming SpaceX launches from the command line')
  .version('0.1.0')
  .option('--local', 'Show launch times in your local timezone instead of UTC');

program
  .command('next')
  .description('Show the next upcoming SpaceX launch with countdown')
  .action(() => {
    const { local } = program.opts();
    return nextCommand({ useLocalTime: local });
  });

program
  .command('list')
  .description('List upcoming SpaceX launches')
  .option('-l, --limit <number>', 'Number of launches to show', '10')
  .action((options) => {
    const { local } = program.opts();
    return listCommand({ ...options, useLocalTime: local });
  });

program
  .command('detail')
  .description('Show full details for a specific launch')
  .argument('<id>', 'Launch ID or slug')
  .action((id) => {
    const { local } = program.opts();
    return detailCommand(id, { useLocalTime: local });
  });

program.parse();
