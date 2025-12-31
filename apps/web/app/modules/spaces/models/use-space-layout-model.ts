import { useLocation } from "react-router";

import type { SpaceDetail } from "~/modules/spaces";

export type SpaceLayoutModel = {
  basePath: string;
  isDocuments: boolean;
  isPlans: boolean;
  isConcepts: boolean;
};

export function useSpaceLayoutModel(space: SpaceDetail): SpaceLayoutModel {
  const location = useLocation();

  const basePath = `/spaces/${space.id}`;
  const pathname = location.pathname;

  const isDocuments = pathname.startsWith(`${basePath}/documents`);
  const isPlans =
    pathname === basePath ||
    pathname.startsWith(`${basePath}/plans`) ||
    pathname.startsWith(`${basePath}/plan/`);
  const isConcepts = pathname.startsWith(`${basePath}/concepts`);

  return { basePath, isDocuments, isPlans, isConcepts };
}
