import { redirect, useLoaderData } from "react-router";
import { z } from "zod";

import type { HomeQueueItem } from "~/api/compat/home";
import type { PlanDetailData } from "~/features/plans/detail/types";
import type { Route } from "./+types/plan-detail";

import { PlanDetailView } from "~/features/plans/detail/plan-detail-view";
import { usePlanDetailModel } from "~/features/plans/detail/use-plan-detail-model";
import { getSpaceForUi } from "~/api/compat/spaces";
import { getPlanForUi } from "~/api/compat/plans";
import { updatePlanStatus } from "~/api/plans";
import { PublicIdSchema } from "~/mock/schemas";

const SpaceIdSchema = PublicIdSchema;
const PlanIdSchema = PublicIdSchema;
const IntentSchema = z.enum(["pause", "resume", "archive"]);

export function meta() {
  return [{ title: "학습 계획 상세" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  const planId = PlanIdSchema.safeParse(params.planId);
  if (!spaceId.success || !planId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const space = await getSpaceForUi(spaceId.data);
  const plan = await getPlanForUi(planId.data);
  if (plan.spaceId !== spaceId.data) {
    throw new Response("Not Found", { status: 404 });
  }

  const nextQueue: Array<HomeQueueItem> = plan.modules
    .flatMap((m) =>
      m.sessions.map((s) => ({
        moduleTitle: m.title,
        session: s,
      })),
    )
    .filter((x) => x.session.status !== "completed")
    .sort((a, b) =>
      a.session.scheduledDate.localeCompare(b.session.scheduledDate),
    )
    .slice(0, 3)
    .map(({ moduleTitle, session }) => ({
      href: `/session?sessionId=${encodeURIComponent(session.id)}`,
      kind: "SESSION",
      sessionId: session.id,
      spaceId: space.id,
      spaceName: space.name,
      planId: plan.id,
      planTitle: plan.title,
      moduleTitle,
      sessionTitle: session.title,
      type: session.type,
      status: session.status,
      scheduledDate: session.scheduledDate,
      durationMinutes: session.durationMinutes,
      spaceIcon: space.icon ?? "book",
      spaceColor: space.color ?? "blue",
    }));

  return {
    space,
    plan,
    nextQueue,
    sourceDocuments: [],
  };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const planId = PlanIdSchema.safeParse(params.planId);
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!planId.success || !spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = IntentSchema.safeParse(String(formData.get("intent") ?? ""));
  if (!intent.success) {
    throw new Response("Bad Request", { status: 400 });
  }

  if (intent.data === "pause") {
    await updatePlanStatus(planId.data, "PAUSED");
    return null;
  }
  if (intent.data === "resume") {
    await updatePlanStatus(planId.data, "ACTIVE");
    return null;
  }
  if (intent.data === "archive") {
    await updatePlanStatus(planId.data, "ARCHIVED");
    throw redirect(`/spaces/${spaceId.data}/plans`);
  }
  return null;
}

export default function PlanDetailRoute() {
  const data: PlanDetailData = useLoaderData<typeof clientLoader>();
  const model = usePlanDetailModel({
    plan: data.plan,
    nextQueue: data.nextQueue,
  });
  return (
    <PlanDetailView
      data={data}
      model={model}
    />
  );
}
