import { useLocation } from "react-router";

import type { Space } from "~/mock/schemas";

export type SpaceLayoutModel = {
  basePath: string;
  isDocuments: boolean;
  isPlans: boolean;
  isConcepts: boolean;
};

export function useSpaceLayoutModel(space: Space): SpaceLayoutModel {
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
