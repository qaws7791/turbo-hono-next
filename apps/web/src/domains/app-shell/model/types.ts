export type AppShellUser = {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "team";
};

export type AppShellData = {
  user: AppShellUser;
};

export type CommandAction = {
  group: string;
  label: string;
  shortcut?: string;
  run: () => void;
};
