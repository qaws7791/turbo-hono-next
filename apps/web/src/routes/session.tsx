import * as React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  redirect,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router";

import type { Route } from "./+types/session";

import { authQueries } from "~/domains/auth";
import {
  SessionView,
  createOrResumeSessionRun,
  sessionQueries,
  useSessionController,
} from "~/domains/session";
import { PublicIdSchema } from "~/foundation/lib";
import { queryClient } from "~/foundation/query-client";

const RunIdSchema = PublicIdSchema;
const SessionIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "학습 세션" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const sessionQuery = authQueries.getSession();
  await queryClient.prefetchQuery(sessionQuery);
  const session = queryClient.getQueryData(sessionQuery.queryKey);
  if (!session?.isAuthenticated) {
    throw redirect(`/login?redirectTo=${encodeURIComponent("/session")}`);
  }

  const url = new URL(request.url);
  const runIdRaw = url.searchParams.get("runId");
  const sessionIdRaw = url.searchParams.get("sessionId");

  if (runIdRaw) {
    const runId = RunIdSchema.safeParse(runIdRaw);
    if (!runId.success) {
      throw new Response("Not Found", { status: 404 });
    }
    await queryClient.prefetchQuery(sessionQueries.run(runId.data));
    return { mode: "run" as const, runId: runId.data };
  }

  const sessionId = SessionIdSchema.safeParse(sessionIdRaw);
  if (!sessionId.success) {
    throw new Response("Bad Request", { status: 400 });
  }

  return { mode: "start" as const, sessionId: sessionId.data };
}

function safeRedirectTo(value: string | null): string {
  if (!value) return "/home";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/home";
}

export default function SessionRoute() {
  const data = useLoaderData<typeof clientLoader>();
  if (data.mode === "start") {
    return <SessionStart sessionId={data.sessionId} />;
  }
  return <SessionRun runId={data.runId} />;
}

function SessionStart({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate();
  React.useEffect(() => {
    createOrResumeSessionRun(sessionId)
      .then(({ runId }) => {
        navigate(`/session?runId=${encodeURIComponent(runId)}`, {
          replace: true,
        });
      })
      .catch(() => {
        navigate("/home", { replace: true });
      });
  }, [navigate, sessionId]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-muted-foreground">세션 시작 중...</p>
    </div>
  );
}

function SessionRun({ runId }: { runId: string }) {
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
