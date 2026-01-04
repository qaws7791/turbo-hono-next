export type SpaceCard = {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  hasTodo: boolean;
  documentCount: number;
  conceptCount: number;
  lastStudiedAt?: string; // ISO datetime
  activePlan?: {
    id: string;
    title: string;
    progressPercent: number;
  };
};

export type Space = {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  activePlanId?: string;
};
