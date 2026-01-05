import { redirect, useFetcher, useLoaderData, useNavigate } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/plan-wizard";

import { listMaterialsForUi } from "~/domains/materials";
import {
  PlanWizardView,
  createPlanForUi,
  usePlanWizardModel,
} from "~/domains/plans";
import { PublicIdSchema, UuidSchema } from "~/foundation/lib";

const SpaceIdSchema = PublicIdSchema;
const PlanGoalSchema = z.enum(["career", "certificate", "work", "hobby"]);
const PlanLevelSchema = z.enum(["novice", "basic", "intermediate", "advanced"]);

export function meta() {
  return [{ title: "학습 계획 생성" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  const materials = await listMaterialsForUi(spaceId.data);
  return { spaceId: spaceId.data, materials };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  if (intent !== "create-plan") {
    return null;
  }

  const ActionSchema = z.object({
    sourceMaterialIds: z.array(UuidSchema).min(1).max(5),
    goal: PlanGoalSchema,
    level: PlanLevelSchema,
    durationMode: z.enum(["custom", "adaptive"]),
    durationValue: z.coerce.number().int().positive().optional(),
    durationUnit: z.enum(["days", "weeks", "months"]).optional(),
    notes: z.string().max(500).optional(),
  });

  const parsed = ActionSchema.safeParse({
    sourceMaterialIds: formData
      .getAll("sourceMaterialIds")
      .map((v) => String(v)),
    goal: String(formData.get("goal") ?? ""),
    level: String(formData.get("level") ?? ""),
    durationMode: String(formData.get("durationMode") ?? ""),
    durationValue: formData.get("durationValue") ?? undefined,
    durationUnit: formData.get("durationUnit") ?? undefined,
    notes: (() => {
      const raw = String(formData.get("notes") ?? "").trim();
      return raw.length > 0 ? raw : undefined;
    })(),
  });

  if (!parsed.success) {
    throw new Response("Bad Request", { status: 400 });
  }

  const plan = await createPlanForUi(spaceId.data, {
    sourceMaterialIds: parsed.data.sourceMaterialIds,
    goal: parsed.data.goal,
    level: parsed.data.level,
    durationMode: parsed.data.durationMode,
    durationValue: parsed.data.durationValue,
    durationUnit: parsed.data.durationUnit,
    notes: parsed.data.notes,
  });

  throw redirect(`/spaces/${spaceId.data}/plan/${plan.id}`);
}

export default function PlanWizardRoute() {
  const { spaceId, materials } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  const model = usePlanWizardModel({
    materials,
    submitPlan: (formData) => {
      fetcher.submit(formData, { method: "post" });
    },
  });

  return (
    <PlanWizardView
      spaceId={spaceId}
      materials={materials}
      model={model}
      isSubmitting={isSubmitting}
      onCancel={() => navigate(`/spaces/${spaceId}/plans`)}
    />
  );
}
