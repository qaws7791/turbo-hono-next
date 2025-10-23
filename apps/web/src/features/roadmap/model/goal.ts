import type { paths } from "@/api/schema";
import type { Goal } from "@/features/roadmap/model/types";

type ApiGoal =
  paths["/roadmaps/{roadmapId}"]["get"]["responses"][200]["content"]["application/json"]["goals"][number];
type ApiSubGoal = ApiGoal["subGoals"] extends Array<infer T> ? T : never;

export function transformGoals(apiGoals: Array<ApiGoal>): Array<Goal> {
  return apiGoals.map((goal) => {
    const subGoals: Array<ApiSubGoal> = goal.subGoals ?? [];
    const completedSubGoals =
      subGoals.filter((subGoal: ApiSubGoal) => subGoal.isCompleted).length || 0;
    const hasSubGoals = subGoals.length > 0;
    const isCompleted = hasSubGoals
      ? completedSubGoals === subGoals.length
      : false;

    return {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      order: goal.order,
      isExpanded: goal.isExpanded,
      subGoals,
      hasSubGoals,
      completedSubGoals,
      isCompleted,
    };
  });
}
