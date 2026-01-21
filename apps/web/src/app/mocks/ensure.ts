import { worker } from "./worker";

import { env } from "~/foundation/lib/env";

declare global {
  var __mswStartPromise: Promise<unknown> | undefined;
}

const shouldStart = typeof window !== "undefined" && (env.DEV || env.VITE_MSW);

export function ensureMswReady(): Promise<void> {
  if (!shouldStart) return Promise.resolve();

  if (!globalThis.__mswStartPromise) {
    globalThis.__mswStartPromise = worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
    });
  }

  return globalThis.__mswStartPromise.then(() => undefined);
}
