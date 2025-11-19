import type { ToolUIPart } from "ai";
import type { ComponentProps } from "react";
import type { Disclosure, DisclosurePanel } from "../../interaction";

export type ToolProps = ComponentProps<typeof Disclosure>;

export type ToolHeaderProps = {
  title?: string;
  type: ToolUIPart["type"];
  state: ToolUIPart["state"];
  className?: string;
};

export type ToolContentProps = ComponentProps<typeof DisclosurePanel>;

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolUIPart["input"];
};

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ToolUIPart["output"];
  errorText: ToolUIPart["errorText"];
};
