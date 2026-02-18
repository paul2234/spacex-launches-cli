/**
 * Main TUI application. Manages state, dispatches keypresses to the
 * active view, and orchestrates rendering.
 */

import type { Launch } from "../../types.js";
import {
  enterAltScreen,
  hideCursor,
  getTerminalSize,
  renderLines,
} from "./renderer.js";
import { startKeypress } from "./keyhandler.js";
import type { KeyEvent } from "./keyhandler.js";
import { renderListView } from "./views/list-view.js";
import { renderDetailView } from "./views/detail-view.js";

interface TuiState {
  view: "list" | "detail";
  launches: Launch[];
  selectedIndex: number;
  listScrollOffset: number;
  detailScrollOffset: number;
  useLocalTime: boolean;
}

/**
 * Start the interactive TUI application.
 * Takes ownership of the terminal (alt screen, raw mode) until the user quits.
 * Returns a promise that resolves when the TUI exits.
 */
export function startApp(
  launches: Launch[],
  useLocalTime: boolean,
): Promise<void> {
  return new Promise<void>((resolve) => {
    const state: TuiState = {
      view: "list",
      launches,
      selectedIndex: 0,
      listScrollOffset: 0,
      detailScrollOffset: 0,
      useLocalTime,
    };

    // Enter alternate screen and hide cursor
    enterAltScreen();
    hideCursor();

    // Initial render
    render(state);

    // Re-render on terminal resize
    const onResize = () => render(state);
    process.stdout.on("resize", onResize);

    // Handle keypresses
    const stopKeypress = startKeypress((key: KeyEvent) => {
      handleKey(state, key, () => {
        process.stdout.removeListener("resize", onResize);
        stopKeypress();
        resolve();
      });
    });
  });
}

/**
 * Handle a keypress event based on the current view.
 */
function handleKey(state: TuiState, key: KeyEvent, quit: () => void): void {
  // Global: quit on 'q' or Ctrl+C
  if (key.name === "q" || (key.ctrl && key.name === "c")) {
    quit();
    return;
  }

  if (state.view === "list") {
    handleListKey(state, key, quit);
  } else {
    handleDetailKey(state, key);
  }

  render(state);
}

/**
 * Handle keypresses while in the list view.
 */
function handleListKey(
  state: TuiState,
  key: KeyEvent,
  _quit: () => void,
): void {
  const lastIndex = state.launches.length - 1;

  switch (key.name) {
    case "up":
    case "k":
      state.selectedIndex = Math.max(0, state.selectedIndex - 1);
      break;
    case "down":
    case "j":
      state.selectedIndex = Math.min(lastIndex, state.selectedIndex + 1);
      break;
    case "home":
      state.selectedIndex = 0;
      state.listScrollOffset = 0;
      break;
    case "end":
      state.selectedIndex = lastIndex;
      break;
    case "pageup": {
      const { rows } = getTerminalSize();
      const pageSize = Math.max(1, rows - 7);
      state.selectedIndex = Math.max(0, state.selectedIndex - pageSize);
      break;
    }
    case "pagedown": {
      const { rows } = getTerminalSize();
      const pageSize = Math.max(1, rows - 7);
      state.selectedIndex = Math.min(lastIndex, state.selectedIndex + pageSize);
      break;
    }
    case "return":
      state.view = "detail";
      state.detailScrollOffset = 0;
      break;
  }
}

/**
 * Handle keypresses while in the detail view.
 */
function handleDetailKey(state: TuiState, key: KeyEvent): void {
  switch (key.name) {
    case "escape":
    case "backspace":
      state.view = "list";
      break;
    case "up":
    case "k":
      state.detailScrollOffset = Math.max(0, state.detailScrollOffset - 1);
      break;
    case "down":
    case "j":
      state.detailScrollOffset += 1; // clamped during render
      break;
    case "pageup": {
      const { rows } = getTerminalSize();
      const pageSize = Math.max(1, rows - 7);
      state.detailScrollOffset = Math.max(
        0,
        state.detailScrollOffset - pageSize,
      );
      break;
    }
    case "pagedown": {
      const { rows } = getTerminalSize();
      const pageSize = Math.max(1, rows - 7);
      state.detailScrollOffset += pageSize; // clamped during render
      break;
    }
    case "home":
      state.detailScrollOffset = 0;
      break;
  }
}

/**
 * Render the current view to the terminal.
 */
function render(state: TuiState): void {
  const { rows, cols } = getTerminalSize();

  if (state.view === "list") {
    const result = renderListView({
      launches: state.launches,
      selectedIndex: state.selectedIndex,
      scrollOffset: state.listScrollOffset,
      rows,
      cols,
      useLocalTime: state.useLocalTime,
    });
    state.listScrollOffset = result.scrollOffset;
    renderLines(result.lines);
  } else {
    const launch = state.launches[state.selectedIndex];
    const result = renderDetailView({
      launch,
      scrollOffset: state.detailScrollOffset,
      rows,
      cols,
      useLocalTime: state.useLocalTime,
    });
    state.detailScrollOffset = result.scrollOffset;
    renderLines(result.lines);
  }
}
