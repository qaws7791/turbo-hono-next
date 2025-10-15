import { Link } from "@/components/link";
import { RoadmapCard } from "@/domains/roadmap/components/roadmap-card";
import { roadmapsQueryOptions } from "@/domains/roadmap/queries/roadmaps-query-options";
import { Icon } from "@repo/ui/icon";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function RoadmapList() {
  const { data: roadmaps } = useSuspenseQuery(roadmapsQueryOptions());

  const totalRoadmaps = roadmaps?.data?.items.length ?? 0;

  return (
    <div>
      {/* 로드맵 목록 */}
      {totalRoadmaps === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Icon
              type="iconify"
              name="solar--book-minimalistic-outline"
              className="size-8 bg-muted-foreground rounded-full p-2"
            />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            로드맵이 없습니다
          </h3>
          <Link
            to="/app/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
          >
            <Icon
              type="iconify"
              name="solar--add-circle-linear"
              className="w-4 h-4"
            />
            로드맵 만들기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-6 flex-1">
          {roadmaps.data?.items.map((roadmap) => (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
