import { Avatar, AvatarFallback } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { CommandShortcut } from "@repo/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { Separator } from "@repo/ui/separator";
import { Form } from "react-router";

import type { AppShellUser } from "../model/types";

import { initials } from "~/foundation/lib/initials";

function getPlanLabel(plan: string): string {
  const labels: Record<string, string> = {
    free: "무료",
    pro: "프로",
    team: "팀",
  };
  return labels[plan] ?? plan;
}

export function UserMenu({
  user,
  onOpenSettings,
}: {
  user: AppShellUser;
  onOpenSettings: () => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            className="w-full justify-start"
          />
        }
      >
        <Avatar className="mr-2 size-7">
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 text-left">
          <div className="truncate text-sm font-medium">{user.name}</div>
          <div className="text-muted-foreground truncate text-xs">
            {user.email}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 p-2"
      >
        <div className="space-y-1 p-2">
          <div className="text-sm font-medium">{user.name}</div>
          <div className="text-muted-foreground text-xs">{user.email}</div>
          <div className="text-muted-foreground text-xs">
            플랜:{" "}
            <span className="text-foreground font-medium">
              {getPlanLabel(user.plan)}
            </span>
          </div>
        </div>
        <Separator />
        <div className="mt-2 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onOpenSettings}
          >
            설정
            <span className="ml-auto text-xs">
              <CommandShortcut>⌘ ,</CommandShortcut>
            </span>
          </Button>
          <Form
            method="post"
            action="/logout"
          >
            <Button
              variant="ghost"
              className="w-full justify-start"
              type="submit"
            >
              로그아웃
            </Button>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
