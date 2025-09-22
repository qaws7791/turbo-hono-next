import { twMerge } from "tailwind-merge";
import type { SolarIconName } from "../../types/solar-icons";

type IconName = `solar--${SolarIconName}`;

interface IconProps {
  name: IconName;
  type: "iconify" | "iconify-color";
  className?: string;
}

export function Icon({ name, type, className }: IconProps) {
  return (
    <span className={twMerge(type, name, "size-6 inline-block", className)} />
  );
}
