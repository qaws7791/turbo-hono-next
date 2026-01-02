import { worker } from "./worker";

declare global {
  var __mswStartPromise: Promise<unknown> | undefined;
}

const shouldStart =
  typeof window !== "undefined" &&
  (import.meta.env.DEV || import.meta.env.VITE_MSW === "true");

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
