/**
 * Keypress input handling for the TUI.
 * Sets up raw mode and readline keypress events, with clean exit handling.
 */

import readline from "node:readline";
import { exitAltScreen, showCursor } from "./renderer.js";

export interface KeyEvent {
  name: string;
  ctrl: boolean;
  shift: boolean;
}

type KeypressCallback = (key: KeyEvent) => void;

let cleanupDone = false;

/**
 * Perform terminal cleanup: restore cursor, exit alt screen, restore stdin.
 * Safe to call multiple times — only runs once.
 */
function cleanup(): void {
  if (cleanupDone) return;
  cleanupDone = true;
  showCursor();
  exitAltScreen();
  if (process.stdin.isTTY && process.stdin.isRaw) {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();
}

/**
 * Start listening for keypress events.
 * Puts stdin into raw mode and emits structured key events to the callback.
 * Returns a cleanup function to stop listening.
 */
export function startKeypress(callback: KeypressCallback): () => void {
  cleanupDone = false;

  readline.emitKeypressEvents(process.stdin);

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();

  const handler = (_str: string | undefined, key: readline.Key | undefined) => {
    if (!key) return;
    callback({
      name: key.name ?? "",
      ctrl: key.ctrl ?? false,
      shift: key.shift ?? false,
    });
  };

  process.stdin.on("keypress", handler);

  // Ensure clean exit on signals and unhandled errors
  const onExit = () => {
    cleanup();
    process.exit(0);
  };
  const onError = () => {
    cleanup();
    process.exit(1);
  };

  process.on("SIGINT", onExit);
  process.on("SIGTERM", onExit);
  process.on("uncaughtException", onError);

  return () => {
    process.stdin.removeListener("keypress", handler);
    process.removeListener("SIGINT", onExit);
    process.removeListener("SIGTERM", onExit);
    process.removeListener("uncaughtException", onError);
    cleanup();
  };
}
