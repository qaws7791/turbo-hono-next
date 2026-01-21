import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";

import { useSessionController } from "../application";
import { sessionQueries } from "../session.queries";

import { SessionView } from "./session-view";

function safeRedirectTo(value: string | null): string {
  if (!value) return "/home";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/home";
}

export function SessionRunView({ runId }: { runId: string }) {
  const { data: run } = useSuspenseQuery(sessionQueries.run(runId));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const controller = useSessionController(run);
  const [closeDialogOpen, setCloseDialogOpen] = React.useState(false);

  return (
    <SessionView
      controller={controller}
      closeDialogOpen={closeDialogOpen}
      onCloseDialogChange={setCloseDialogOpen}
      onExit={() => {
        controller.saveNow();
        navigate("/home");
      }}
      onDone={() => {
        const redirectTo = safeRedirectTo(searchParams.get("redirectTo"));
        navigate(redirectTo);
      }}
    />
  );
}
