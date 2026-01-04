import * as React from "react";
import {
  redirect,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router";

import type { Route } from "./+types/session";

import { PublicIdSchema } from "~/app/mocks/schemas";
import {
  SessionView,
  createOrResumeSessionRun,
  getSessionRunForUi,
  useSessionController,
} from "~/domains/session";
import { getAuthStatus } from "~/foundation/api/compat/auth";

const RunIdSchema = PublicIdSchema;
const SessionIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "학습 세션" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { isAuthenticated } = await getAuthStatus();
  if (!isAuthenticated) {
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
    return { run: await getSessionRunForUi(runId.data) };
  }

  const sessionId = SessionIdSchema.safeParse(sessionIdRaw);
  if (!sessionId.success) {
    throw new Response("Bad Request", { status: 400 });
  }

  const { runId } = await createOrResumeSessionRun(sessionId.data);
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
