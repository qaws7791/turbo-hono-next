export type AppShellUser = {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "team";
};

export type AppShellSpace = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
};

export type AppShellData = {
  user: AppShellUser;
  spaces: Array<AppShellSpace>;
};

export type CommandAction = {
  group: string;
  label: string;
  shortcut?: string;
  run: () => void;
};
