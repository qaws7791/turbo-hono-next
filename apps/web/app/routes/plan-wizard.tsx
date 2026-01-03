import { redirect, useFetcher, useLoaderData, useNavigate } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/plan-wizard";

import { PlanWizardView } from "~/features/plans/wizard/plan-wizard-view";
import { usePlanWizardModel } from "~/features/plans/wizard/use-plan-wizard-model";
import { listDocumentsForUi } from "~/api/compat/materials";
import { createPlan } from "~/api/plans";
import {
  PlanGoalSchema,
  PlanLevelSchema,
  PublicIdSchema,
  UuidSchema,
} from "~/mock/schemas";

const SpaceIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "학습 계획 생성" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  const documents = await listDocumentsForUi(spaceId.data);
  return { spaceId: spaceId.data, documents };
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
    sourceDocumentIds: z.array(UuidSchema).min(1).max(5),
    goal: PlanGoalSchema,
    level: PlanLevelSchema,
    durationMode: z.enum(["custom", "adaptive"]),
    durationValue: z.coerce.number().int().positive().optional(),
    durationUnit: z.enum(["days", "weeks", "months"]).optional(),
    notes: z.string().max(500).optional(),
  });

  const parsed = ActionSchema.safeParse({
    sourceDocumentIds: formData
      .getAll("sourceDocumentIds")
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

  const goalType =
    parsed.data.goal === "career"
      ? "JOB"
      : parsed.data.goal === "certificate"
        ? "CERT"
        : parsed.data.goal === "work"
          ? "WORK"
          : "HOBBY";

  const currentLevel =
    parsed.data.level === "advanced"
      ? "ADVANCED"
      : parsed.data.level === "intermediate"
        ? "INTERMEDIATE"
        : "BEGINNER";

  const targetDueDate = (() => {
    const base = new Date();
    if (parsed.data.durationMode !== "custom") {
      base.setDate(base.getDate() + 30);
      return base.toISOString().slice(0, 10);
    }

    const value = parsed.data.durationValue ?? 30;
    const unit = parsed.data.durationUnit ?? "days";
    const days =
      unit === "months" ? value * 30 : unit === "weeks" ? value * 7 : value;
    base.setDate(base.getDate() + days);
    return base.toISOString().slice(0, 10);
  })();

  const plan = await createPlan(spaceId.data, {
    materialIds: parsed.data.sourceDocumentIds,
    goalType,
    currentLevel,
    targetDueDate,
    specialRequirements: parsed.data.notes,
  });

  throw redirect(`/spaces/${spaceId.data}/plan/${plan.id}`);
}

export default function PlanWizardRoute() {
  const { spaceId, documents } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  const model = usePlanWizardModel({
    documents,
    submitPlan: (formData) => {
      fetcher.submit(formData, { method: "post" });
    },
  });

  return (
    <PlanWizardView
      spaceId={spaceId}
      documents={documents}
      model={model}
      isSubmitting={isSubmitting}
      onCancel={() => navigate(`/spaces/${spaceId}/plans`)}
    />
  );
}
