import * as React from "react";

export function useCountdown(seconds: number, isActive: boolean): number {
  const [left, setLeft] = React.useState(seconds);

  React.useEffect(() => {
    if (!isActive) {
      setLeft(seconds);
      return;
    }

    setLeft(seconds);
    const timer = window.setInterval(() => {
      setLeft((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [seconds, isActive]);

  return left;
}
