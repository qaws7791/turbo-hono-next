import {
  IconBook,
  IconBrain,
  IconCode,
  IconLanguage,
  IconMusic,
  IconPalette,
  IconPlane,
  IconRocket,
  IconTarget,
} from "@tabler/icons-react";

import type { ComponentType, SVGProps } from "react";

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  book: IconBook,
  code: IconCode,
  brain: IconBrain,
  language: IconLanguage,
  music: IconMusic,
  palette: IconPalette,
  plane: IconPlane,
  rocket: IconRocket,
  target: IconTarget,
};

const COLORS: Record<string, { value: string }> = {
  blue: { value: "#3b82f6" },
  green: { value: "#22c55e" },
  purple: { value: "#a855f7" },
  orange: { value: "#f97316" },
  pink: { value: "#ec4899" },
  yellow: { value: "#eab308" },
  red: { value: "#ef4444" },
  teal: { value: "#14b8a6" },
  indigo: { value: "#6366f1" },
};

export function getIconByName(
  name: string,
): ComponentType<SVGProps<SVGSVGElement>> {
  return ICONS[name] ?? IconTarget;
}

export function getColorByName(name: string): { value: string } | undefined {
  return COLORS[name];
}
