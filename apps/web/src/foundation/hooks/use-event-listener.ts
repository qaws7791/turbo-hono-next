import * as React from "react";

export function useEventListener<TEventName extends keyof WindowEventMap>(
  target: Window | null,
  type: TEventName,
  listener: (event: WindowEventMap[TEventName]) => void,
): void {
  const listenerRef = React.useRef(listener);

  React.useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  React.useEffect(() => {
    if (!target) return;
    const handler = (event: WindowEventMap[TEventName]) =>
      listenerRef.current(event);
    target.addEventListener(type, handler);
    return () => target.removeEventListener(type, handler);
  }, [target, type]);
}
