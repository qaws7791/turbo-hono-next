import { useLocation } from "react-router";

import type { Space } from "~/app/mocks/schemas";

export type SpaceLayoutModel = {
  basePath: string;
  isMaterials: boolean;
  isPlans: boolean;
  isConcepts: boolean;
};

export function useSpaceLayoutModel(space: Space): SpaceLayoutModel {
  const location = useLocation();

  const basePath = `/spaces/${space.id}`;
  const pathname = location.pathname;

  const isMaterials = pathname.startsWith(`${basePath}/documents`);
  const isPlans =
    pathname === basePath ||
    pathname.startsWith(`${basePath}/plans`) ||
    pathname.startsWith(`${basePath}/plan/`);
  const isConcepts = pathname.startsWith(`${basePath}/concepts`);

  return { basePath, isMaterials, isPlans, isConcepts };
}
