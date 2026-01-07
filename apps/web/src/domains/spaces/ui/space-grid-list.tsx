import { Link } from "react-router";

import { SpaceCard } from "./space-card";

import type { SpaceCard as SpaceCardType } from "../model/spaces.types";

interface SpaceGridListProps {
  spaces: Array<SpaceCardType>;
}

export function SpaceGridList({ spaces }: SpaceGridListProps) {
  return (
    <>
      <div className="text-muted-foreground text-sm">
        {spaces.length}개 표시
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {spaces.map((space) => (
          <Link
            key={space.id}
            to={`/spaces/${space.id}`}
            className="block"
          >
            <SpaceCard space={space} />
          </Link>
        ))}
      </div>
    </>
  );
}
