import {
  History,
  HistoryContent,
  HistoryGroup,
  HistoryItem,
} from "@repo/ui/ai";

import type { Conversation } from "@repo/ai-types";

interface HistoryOverlayProps {
  isVisible: boolean;
  histories: Array<Conversation>;
  isLoading: boolean;
  onSelectChat: (id: string) => void;
}

export function HistoryOverlay({
  isVisible,
  histories,
  isLoading,
  onSelectChat,
}: HistoryOverlayProps) {
  if (!isVisible) {
    return null;
  }
  if (isLoading) {
    return <div>로딩중</div>;
  }
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0">
      <History className="flex-1">
        <HistoryContent>
          <HistoryGroup label="오늘">
            {histories.map((h) => (
              <HistoryItem
                key={h.id}
                onClick={() => onSelectChat(h.id)}
              >
                {h.title}
              </HistoryItem>
            ))}
          </HistoryGroup>
        </HistoryContent>
      </History>
    </div>
  );
}
