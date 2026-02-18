import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { UpcomingLaunchesResponse } from '../src/types.js';
import { OUTPUT_DIR } from './config.js';

/**
 * Write the transformed launch data to JSON files in the output directory.
 */
export async function publishData(data: UpcomingLaunchesResponse): Promise<void> {
  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  const filePath = join(OUTPUT_DIR, 'upcoming.json');
  const json = JSON.stringify(data, null, 2);

  await writeFile(filePath, json, 'utf-8');
  console.log(`  Written ${data.launches.length} launches to ${filePath}`);
}
