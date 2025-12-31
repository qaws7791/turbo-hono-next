import type { AuthUser } from "~/modules/auth";
import type { Space } from "~/modules/spaces";

export type AppShellData = {
  user: AuthUser;
  spaces: Array<Space>;
};

export type CommandAction = {
  group: string;
  label: string;
  shortcut?: string;
  run: () => void;
};
