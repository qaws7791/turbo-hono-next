import type { Space, User } from "~/app/mocks/schemas";

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
