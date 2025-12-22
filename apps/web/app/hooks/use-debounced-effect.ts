import * as React from "react";

export function useDebouncedEffect(
  effect: () => void,
  deps: Array<unknown>,
  delayMs: number,
): void {
  React.useEffect(() => {
    const timer = window.setTimeout(() => effect(), delayMs);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delayMs]);
}

