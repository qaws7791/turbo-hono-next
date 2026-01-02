import * as React from "react";

import type { NavigateFunction } from "react-router";
import type { CommandAction } from "./types";

export function useCommandActions(input: {
  navigate: NavigateFunction;
  openSettings: () => void;
}): Array<CommandAction> {
  return React.useMemo(
    () => [
      {
        group: "이동",
        label: "홈",
        shortcut: "G H",
        run: () => input.navigate("/home"),
      },
      {
        group: "이동",
        label: "스페이스",
        shortcut: "G S",
        run: () => input.navigate("/spaces"),
      },
      {
        group: "이동",
        label: "개념 라이브러리",
        shortcut: "G C",
        run: () => input.navigate("/concepts"),
      },
      {
        group: "액션",
        label: "설정",
        shortcut: "⌘ ,",
        run: input.openSettings,
      },
    ],
    [input],
  );
}
