import type React from "react";
import type {
  DisclosureGroupProps as AriaDisclosureGroupProps,
  DisclosurePanelProps as AriaDisclosurePanelProps,
  DisclosureProps as AriaDisclosureProps,
  ButtonProps,
} from "react-aria-components";

export interface DisclosureProps extends AriaDisclosureProps {
  children: React.ReactNode;
}

export interface DisclosureHeaderProps {
  children: React.ReactNode;
  className?: ButtonProps["className"];
}

export interface DisclosurePanelProps extends AriaDisclosurePanelProps {
  children: React.ReactNode;
}

export interface DisclosureGroupProps extends AriaDisclosureGroupProps {
  children: React.ReactNode;
}
