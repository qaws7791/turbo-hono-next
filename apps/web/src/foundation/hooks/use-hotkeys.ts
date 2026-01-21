import * as React from "react";

import { useEventListener } from "./use-event-listener";

export type Hotkey = {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
  handler: (event: KeyboardEvent) => void;
};

function matches(event: KeyboardEvent, hotkey: Hotkey): boolean {
  if (event.key.toLowerCase() !== hotkey.key.toLowerCase()) return false;
  if (hotkey.meta !== undefined && event.metaKey !== hotkey.meta) return false;
  if (hotkey.ctrl !== undefined && event.ctrlKey !== hotkey.ctrl) return false;
  if (hotkey.shift !== undefined && event.shiftKey !== hotkey.shift)
    return false;
  if (hotkey.alt !== undefined && event.altKey !== hotkey.alt) return false;
  return true;
}

export function useHotkeys(hotkeys: Array<Hotkey>): void {
  const stable = React.useMemo(() => hotkeys, [hotkeys]);

  const target = typeof window === "undefined" ? null : window;

  useEventListener(target, "keydown", (event) => {
    for (const hotkey of stable) {
      if (!matches(event, hotkey)) continue;
      if (hotkey.preventDefault ?? true) {
        event.preventDefault();
      }
      hotkey.handler(event);
      return;
    }
  });
}
