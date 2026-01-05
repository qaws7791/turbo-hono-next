import { useLocation } from "react-router";

import type { Space } from "../model/spaces.types";

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

  const isMaterials = pathname.startsWith(`${basePath}/materials`);
  const isPlans =
    pathname === basePath ||
    pathname.startsWith(`${basePath}/plans`) ||
    pathname.startsWith(`${basePath}/plan/`);
  const isConcepts = pathname.startsWith(`${basePath}/concepts`);

  return { basePath, isMaterials, isPlans, isConcepts };
}
