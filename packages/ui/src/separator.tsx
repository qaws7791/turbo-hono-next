import { useSeparator } from "react-aria";

import { twMerge } from "./utils";

import type { ComponentProps } from "react";
import type { SeparatorProps as SeparatorPropsReactAria } from "react-aria";

type SeparatorProps = SeparatorPropsReactAria & ComponentProps<"div">;

function Separator(props: SeparatorProps) {
  const { separatorProps } = useSeparator(props);

  return (
    <div
      {...separatorProps}
      className={twMerge(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
      )}
    />
  );
}

export { Separator };
