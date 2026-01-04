import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@repo/ui/command";
import * as React from "react";

import type { CommandAction } from "../model/types";

function groupNames(actions: Array<CommandAction>): Array<string> {
  return Array.from(new Set(actions.map((a) => a.group)));
}

export function AppCommandPalette({
  open,
  onOpenChange,
  actions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: Array<CommandAction>;
}) {
  const groups = React.useMemo(() => groupNames(actions), [actions]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <Command>
        <CommandInput placeholder="검색..." />
        <CommandList>
          <CommandEmpty>결과가 없습니다.</CommandEmpty>
          <CommandSeparator />
          {groups.map((group) => (
            <CommandGroup
              key={group}
              heading={group}
            >
              {actions
                .filter((a) => a.group === group)
                .map((a) => (
                  <CommandItem
                    key={a.label}
                    onSelect={() => {
                      onOpenChange(false);
                      a.run();
                    }}
                  >
                    {a.label}
                    {a.shortcut ? (
                      <CommandShortcut>{a.shortcut}</CommandShortcut>
                    ) : null}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
