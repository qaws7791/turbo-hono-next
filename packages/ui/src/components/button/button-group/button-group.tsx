"use client";

import { cn } from "../../../utils";
import { Separator } from "../../layout/separator";

import { buttonGroupStyles } from "./button-group.styles";

import type {
  ButtonGroupProps,
  ButtonGroupTextProps,
} from "./button-group.types";

/**
 * ButtonGroup component
 *
 * @description
 * A container for grouping related buttons together, removing borders between them.
 * Supports horizontal and vertical orientations.
 *
 * @example
 * Horizontal button group
 * ```tsx
 * <ButtonGroup>
 *   <Button>Left</Button>
 *   <Button>Middle</Button>
 *   <Button>Right</Button>
 * </ButtonGroup>
 * ```
 *
 * @example
 * Vertical button group
 * ```tsx
 * <ButtonGroup orientation="vertical">
 *   <Button>Top</Button>
 *   <Button>Bottom</Button>
 * </ButtonGroup>
 * ```
 */
function ButtonGroup({ className, orientation, ...props }: ButtonGroupProps) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupStyles({ orientation }), className)}
      {...props}
    />
  );
}

ButtonGroup.displayName = "ButtonGroup";

/**
 * ButtonGroupText component
 *
 * @description
 * A text display component within a ButtonGroup for showing labels or status.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button>Left</Button>
 *   <ButtonGroupText>or</ButtonGroupText>
 *   <Button>Right</Button>
 * </ButtonGroup>
 * ```
 */
function ButtonGroupText({ className, ...props }: ButtonGroupTextProps) {
  return (
    <div
      className={cn(
        "bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

ButtonGroupText.displayName = "ButtonGroupText";

/**
 * ButtonGroupSeparator component
 *
 * @description
 * A separator component for visual separation within a ButtonGroup.
 */
function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto",
        className,
      )}
      {...props}
    />
  );
}

ButtonGroupSeparator.displayName = "ButtonGroupSeparator";

export {
  ButtonGroup,
  ButtonGroupSeparator,
  buttonGroupStyles,
  ButtonGroupText,
};
export type { ButtonGroupProps, ButtonGroupTextProps };
