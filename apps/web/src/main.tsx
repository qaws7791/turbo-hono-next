import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { createAppRouter, createRouterContext } from "@/app/router";
import * as TanStackQueryProvider from "@/app/providers/query-client";
import { useAuth } from "@/features/auth/hooks/use-auth";
import reportWebVitals from "@/reportWebVitals.ts";
import "@repo/ui/components.css";
import "@/styles.css";

const queryClientContext = TanStackQueryProvider.getContext();
const routerContext = createRouterContext(queryClientContext.queryClient);
export const router = createAppRouter(routerContext);

function App() {
  const auth = useAuth();
  return (
    <RouterProvider
      router={router}
      context={{ auth }}
    />
  );
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...queryClientContext}>
        <App />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
