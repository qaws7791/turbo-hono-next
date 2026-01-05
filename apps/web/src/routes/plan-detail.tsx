import { useLoaderData } from "react-router";

import type { HomeQueueItem } from "~/domains/home";
import type { PlanDetailData } from "~/domains/plans";
import type { Route } from "./+types/plan-detail";

import {
  PlanDetailView,
  getPlanForUi,
  usePlanDetailModel,
} from "~/domains/plans";
import { getSpaceForUi } from "~/domains/spaces";
import { PublicIdSchema } from "~/foundation/lib";

const SpaceIdSchema = PublicIdSchema;
const PlanIdSchema = PublicIdSchema;

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
    sourceMaterials: [],
  };
}

export default function PlanDetailRoute() {
  const data: PlanDetailData = useLoaderData<typeof clientLoader>();
  const model = usePlanDetailModel({
    plan: data.plan,
    nextQueue: data.nextQueue,
    spaceId: data.space.id,
  });
  return (
    <PlanDetailView
      data={data}
      model={model}
    />
  );
}
