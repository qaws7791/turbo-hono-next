import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import * as TanStackQueryProvider from "@/integrations/tanstack-query/root-provider.tsx";

// Import the generated route tree
import { routeTree } from "@/routeTree.gen";

import { AuthProvider, useAuth } from "@/domains/auth/use-auth.tsx";
import reportWebVitals from "@/reportWebVitals.ts";
import "@/styles.css";
//
import "@repo/ui/components.css";

// Create a new router instance

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();
export const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
    auth: undefined!,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  return (
    <RouterProvider
      router={router}
      context={{ auth }}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <App />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
