import { useSearchParams } from "react-router";
import { z } from "zod";

export const SpaceTabSchema = z.enum(["plans", "materials"]).catch("plans");

export type SpaceTab = z.infer<typeof SpaceTabSchema>;

export type SpaceTabs = {
  tab: SpaceTab;
};

export function useSpaceTabs(): SpaceTabs {
  const [searchParams] = useSearchParams();
  const tab = SpaceTabSchema.parse(searchParams.get("tab"));

  return { tab };
}
