/**
 * Low-level terminal screen operations for the TUI.
 * Uses ANSI escape sequences for cursor control, screen clearing,
 * and alternate screen buffer management.
 */

const ESC = "\x1b";

/** Switch to the alternate screen buffer (preserves user's scrollback). */
export function enterAltScreen(): void {
  process.stdout.write(`${ESC}[?1049h`);
}

/** Restore the original screen buffer. */
export function exitAltScreen(): void {
  process.stdout.write(`${ESC}[?1049l`);
}

/** Hide the terminal cursor. */
export function hideCursor(): void {
  process.stdout.write(`${ESC}[?25l`);
}

/** Show the terminal cursor. */
export function showCursor(): void {
  process.stdout.write(`${ESC}[?25h`);
}

/** Clear the entire screen and move cursor to top-left. */
export function clearScreen(): void {
  process.stdout.write(`${ESC}[2J${ESC}[H`);
}

/** Get the current terminal dimensions. */
export function getTerminalSize(): { rows: number; cols: number } {
  return {
    rows: process.stdout.rows || 24,
    cols: process.stdout.columns || 80,
  };
}

/** Write an array of lines to the screen, clearing first. */
export function renderLines(lines: string[]): void {
  clearScreen();
  process.stdout.write(lines.join("\n"));
}
