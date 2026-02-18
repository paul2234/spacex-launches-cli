import { fetchUpcomingLaunches } from './fetch.js';
import { transformLaunches } from './transform.js';
import { publishData } from './publish.js';

/**
 * Main pipeline entry point.
 * Fetches upcoming SpaceX launches from the LL2 API, transforms them
 * into the domain format, and writes the result to static JSON files.
 */
async function main(): Promise<void> {
  console.log('SpaceX CLI Data Pipeline');
  console.log('========================\n');

  try {
    console.log('1. Fetching upcoming launches from LL2 API...');
    const rawLaunches = await fetchUpcomingLaunches();
    console.log(`   Found ${rawLaunches.length} launches\n`);

    console.log('2. Transforming data...');
    const data = transformLaunches(rawLaunches);
    console.log(`   Transformed ${data.launches.length} launches\n`);

    console.log('3. Publishing data...');
    await publishData(data);
    console.log('\nDone!');
  } catch (error) {
    console.error('\nPipeline failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
