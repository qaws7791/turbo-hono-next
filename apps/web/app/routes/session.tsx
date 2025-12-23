import * as React from "react";
import { redirect, useLoaderData, useNavigate, useSearchParams } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/session";

import { SessionView } from "~/features/session/session-view";
import { useSessionController } from "~/features/session/use-session-controller";
import { authStatus, getSessionRun, startSession } from "~/mock/api";

const RunIdSchema = z.string().uuid();
const PlanIdSchema = z.string().uuid();
const SessionIdSchema = z.string().uuid();

export function meta() {
  return [{ title: "학습 세션" }];
}

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { isAuthenticated } = authStatus();
  if (!isAuthenticated) {
    throw redirect(`/login?redirectTo=${encodeURIComponent("/session")}`);
  }

  const url = new URL(request.url);
  const runIdRaw = url.searchParams.get("runId");
  const planIdRaw = url.searchParams.get("planId");
  const sessionIdRaw = url.searchParams.get("sessionId");

  if (runIdRaw) {
    const runId = RunIdSchema.safeParse(runIdRaw);
    if (!runId.success) {
      throw new Response("Not Found", { status: 404 });
    }
    return { run: getSessionRun(runId.data) };
  }

  const planId = PlanIdSchema.safeParse(planIdRaw);
  const sessionId = SessionIdSchema.safeParse(sessionIdRaw);
  if (!planId.success || !sessionId.success) {
    throw new Response("Bad Request", { status: 400 });
  }

  const { runId } = startSession({ planId: planId.data, sessionId: sessionId.data });
  throw redirect(`/session?runId=${runId}`);
}

function safeRedirectTo(value: string | null): string {
  if (!value) return "/home";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/home";
}

export default function SessionRoute() {
  const { run } = useLoaderData<typeof clientLoader>();
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

