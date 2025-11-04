import { Icon } from "@repo/ui/icon";

import { LearningPlanCard } from "@/features/learning-plan/components/learning-plan-card";
import { useLearningPlanList } from "@/features/learning-plan/hooks/use-learning-plan-list";
import { Link } from "@/shared/components/link";

export default function LearningPlanList() {
  const { data: learningPlans } = useLearningPlanList();

  const totalLearningPlans = learningPlans?.data?.items.length ?? 0;

  return (
    <div className="flex-1">
      {/* 학습 계획 목록 */}
      {totalLearningPlans === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center w-full">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Icon
              type="iconify"
              name="solar--book-minimalistic-outline"
              className="size-8 bg-muted-foreground rounded-full p-2"
            />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            학습 계획이 없습니다
          </h3>
          <Link
            to="/app/create"
            variant="secondary"
          >
            <Icon
              type="iconify"
              name="solar--add-circle-linear"
              className="w-4 h-4"
            />
            학습 계획 만들기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-6 w-full">
          {learningPlans.data?.items.map((learningPlan) => (
            <LearningPlanCard
              key={learningPlan.id}
              learningPlan={learningPlan}
            />
          ))}
        </div>
      )}
    </div>
  );
}
