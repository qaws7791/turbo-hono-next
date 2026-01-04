import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Toaster } from "@repo/ui/sonner";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";

import type { Route } from "./+types/root";

import "~/app/styles/app.css";

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || import.meta.env.VITE_MSW === "true")
) {
  void import("~/app/mocks/browser");
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  const showStack =
    typeof window !== "undefined" && window.location.hostname === "localhost";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (showStack && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">{message}</CardTitle>
          <p className="text-muted-foreground text-sm">{details}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {stack ? (
            <pre className="bg-muted overflow-x-auto rounded-xl p-4 text-xs">
              <code>{stack}</code>
            </pre>
          ) : null}
          <Button
            variant="outline"
            onClick={() => {
              window.location.assign("/");
            }}
          >
            랜딩으로
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
