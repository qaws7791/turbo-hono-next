import type { Space, User } from "~/mock/schemas";

export type AppShellData = {
  user: User;
  spaces: Array<Space>;
};

export type CommandAction = {
  group: string;
  label: string;
  shortcut?: string;
  run: () => void;
};

