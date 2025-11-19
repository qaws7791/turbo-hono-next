import type { ComponentProps } from "react";
import type { BundledLanguage } from "shiki";

export type CodeBlockProps = ComponentProps<"div"> & {
  code: string;
  language: BundledLanguage;
  showLineNumbers?: boolean;
};
