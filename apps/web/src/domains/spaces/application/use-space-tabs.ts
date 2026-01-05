import { useLocation } from "react-router";

export type SpaceTabs = {
  basePath: string;
  isMaterials: boolean;
  isPlans: boolean;
  isConcepts: boolean;
};

export function useSpaceTabs(spaceId: string): SpaceTabs {
  const location = useLocation();

  const basePath = `/spaces/${spaceId}`;
  const pathname = location.pathname;

  const isMaterials = pathname.startsWith(`${basePath}/materials`);
  const isPlans =
    pathname === basePath ||
    pathname.startsWith(`${basePath}/plans`) ||
    pathname.startsWith(`${basePath}/plan/`);
  const isConcepts = pathname.startsWith(`${basePath}/concepts`);

  return { basePath, isMaterials, isPlans, isConcepts };
}
