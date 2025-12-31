import { Avatar, AvatarFallback } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { CommandShortcut } from "@repo/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { Separator } from "@repo/ui/separator";
import { useNavigate } from "react-router";

import type { AuthUser } from "~/modules/auth";

import { initials } from "~/lib/initials";
import { useLogoutMutation } from "~/modules/auth";

export function UserMenu({
  user,
  onOpenSettings,
}: {
  user: AuthUser;
  onOpenSettings: () => void;
}) {
  const navigate = useNavigate();
  const logout = useLogoutMutation();

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
          <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 text-left">
          <div className="truncate text-sm font-medium">{user.displayName}</div>
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
          <div className="text-sm font-medium">{user.displayName}</div>
          <div className="text-muted-foreground text-xs">{user.email}</div>
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
          <Button
            variant="ghost"
            className="w-full justify-start"
            type="button"
            disabled={logout.isPending}
            onClick={() => {
              logout.mutate(undefined, {
                onSettled: () => {
                  navigate("/", { replace: true });
                },
              });
            }}
          >
            {logout.isPending ? "로그아웃 중" : "로그아웃"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
