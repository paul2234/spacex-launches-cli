/**
 * Detail view: renders full launch information for a single launch.
 * Reuses the existing formatLaunchDetail formatter.
 * Supports scrolling when content exceeds terminal height.
 */

import chalk from "chalk";
import type { Launch } from "../../../types.js";
import { formatLaunchDetail } from "../../formatters.js";

/** Number of footer lines below the content (blank + nav hints + blank). */
const FOOTER_LINES = 3;
/** Number of header lines above the content (blank + title + separator + blank). */
const HEADER_LINES = 4;

interface DetailViewOptions {
  launch: Launch;
  scrollOffset: number;
  rows: number;
  cols: number;
  useLocalTime: boolean;
}

/**
 * Render the detail view and return the lines to display,
 * along with the adjusted scroll offset.
 */
export function renderDetailView(options: DetailViewOptions): {
  lines: string[];
  scrollOffset: number;
  maxScroll: number;
} {
  const { launch, rows, useLocalTime } = options;
  let { scrollOffset } = options;
  const lines: string[] = [];

  // Header
  lines.push("");
  lines.push(chalk.bold.cyan("  Launch Details"));
  lines.push(chalk.dim(`  ${"─".repeat(40)}`));
  lines.push("");

  // Generate the detail content using the existing formatter
  const detailContent = formatLaunchDetail(launch, useLocalTime);
  const contentLines = detailContent.split("\n");

  // Calculate how many content lines fit in the terminal
  const visibleContentRows = Math.max(1, rows - HEADER_LINES - FOOTER_LINES);

  // Calculate max scroll
  const maxScroll = Math.max(0, contentLines.length - visibleContentRows);

  // Clamp scroll offset
  scrollOffset = Math.max(0, Math.min(scrollOffset, maxScroll));

  // Slice visible content
  const visibleContent = contentLines.slice(
    scrollOffset,
    scrollOffset + visibleContentRows,
  );
  lines.push(...visibleContent);

  // Pad remaining rows
  for (let i = visibleContent.length; i < visibleContentRows; i++) {
    lines.push("");
  }

  // Scroll indicator (only show if content is scrollable)
  const scrollHint =
    contentLines.length > visibleContentRows
      ? `  ${chalk.dim("↑↓")} Scroll  `
      : "  ";

  // Footer
  lines.push("");
  lines.push(
    `  ${chalk.dim("Esc/Backspace")} Back to list  ${scrollHint}${chalk.dim("q")} Quit`,
  );
  lines.push("");

  return { lines, scrollOffset, maxScroll };
}
