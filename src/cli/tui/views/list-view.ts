/**
 * List view: renders a scrollable, selectable table of upcoming launches.
 * The selected row is highlighted and the view scrolls to keep
 * the selection visible within the terminal window.
 */

import chalk from "chalk";
import type { Launch } from "../../../types.js";
import { formatStatus } from "../../formatters.js";

/** Number of header lines above the table rows (title + blank + column header + separator). */
const HEADER_LINES = 4;
/** Number of footer lines below the table rows (blank + nav hints + blank). */
const FOOTER_LINES = 3;

interface ListViewOptions {
  launches: Launch[];
  selectedIndex: number;
  scrollOffset: number;
  rows: number;
  cols: number;
  useLocalTime: boolean;
}

/**
 * Render the list view and return the lines to display,
 * along with the adjusted scroll offset.
 */
export function renderListView(options: ListViewOptions): {
  lines: string[];
  scrollOffset: number;
} {
  const { launches, selectedIndex, rows, cols, useLocalTime } = options;
  let { scrollOffset } = options;
  const lines: string[] = [];

  // Calculate how many table rows fit in the terminal
  const visibleRows = Math.max(1, rows - HEADER_LINES - FOOTER_LINES);

  // Adjust scroll offset to keep the selected item visible
  if (selectedIndex < scrollOffset) {
    scrollOffset = selectedIndex;
  } else if (selectedIndex >= scrollOffset + visibleRows) {
    scrollOffset = selectedIndex - visibleRows + 1;
  }

  // Clamp scroll offset
  scrollOffset = Math.max(
    0,
    Math.min(scrollOffset, launches.length - visibleRows),
  );
  scrollOffset = Math.max(0, scrollOffset);

  const visibleLaunches = launches.slice(
    scrollOffset,
    scrollOffset + visibleRows,
  );

  // Header
  lines.push("");
  lines.push(chalk.bold.cyan("  Upcoming SpaceX Launches"));
  lines.push("");

  // Column header
  const colHeader = `    ${padStr("Date", 22)} ${padStr("Status", 10)} ${padStr("Rocket", 20)} ${"Mission"}`;
  lines.push(chalk.bold.white(colHeader));

  // Table rows
  for (let i = 0; i < visibleLaunches.length; i++) {
    const launch = visibleLaunches[i];
    const absoluteIndex = scrollOffset + i;
    const isSelected = absoluteIndex === selectedIndex;

    const date = formatDateShort(launch.net, useLocalTime);
    const status = formatStatusShort(launch.status);
    const rocket = launch.rocket.name;
    const mission = launch.mission?.name ?? launch.name;

    const prefix = isSelected ? chalk.cyan("▶ ") : "  ";
    const row = `${prefix}${padStr(date, 22)} ${padStr(status, 10)} ${padStr(rocket, 20)} ${mission}`;

    if (isSelected) {
      lines.push(chalk.inverse(row));
    } else {
      lines.push(row);
    }
  }

  // Pad remaining visible rows with empty lines (prevents leftover text on resize)
  for (let i = visibleLaunches.length; i < visibleRows; i++) {
    lines.push("");
  }

  // Scroll indicator
  const totalItems = launches.length;
  const scrollInfo =
    totalItems > visibleRows
      ? chalk.dim(
          `  ${scrollOffset + 1}-${Math.min(scrollOffset + visibleRows, totalItems)} of ${totalItems}`,
        )
      : chalk.dim(`  ${totalItems} launches`);

  // Footer
  lines.push("");
  lines.push(
    `  ${chalk.dim("↑↓")} Navigate  ${chalk.dim("Enter")} View details  ${chalk.dim("q")} Quit  ${scrollInfo}`,
  );
  lines.push("");

  return { lines, scrollOffset };
}

/**
 * Short date format for the table: "Feb 18, 08:00 UTC"
 */
function formatDateShort(isoDate: string, useLocalTime: boolean): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: useLocalTime ? undefined : "UTC",
    timeZoneName: "short",
    hour12: false,
  });
}

/**
 * Short colorized status for the table.
 */
function formatStatusShort(status: Launch["status"]): string {
  return formatStatus({ ...status, name: status.abbrev });
}

/**
 * Right-pad a string, accounting for ANSI escape codes in visible length.
 */
function padStr(str: string, width: number): string {
  const visible = str.replace(/\x1b\[[0-9;]*m/g, "");
  const padding = Math.max(0, width - visible.length);
  return str + " ".repeat(padding);
}
