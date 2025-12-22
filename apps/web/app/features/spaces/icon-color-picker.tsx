import { Button } from "@repo/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { ScrollArea } from "@repo/ui/scroll-area";
import {
  IconBook,
  IconBookmark,
  IconBrain,
  IconBriefcase,
  IconBulb,
  IconCalendar,
  IconCamera,
  IconChartBar,
  IconCode,
  IconCoffee,
  IconCpu,
  IconDatabase,
  IconDeviceGamepad2,
  IconFile,
  IconFlame,
  IconFolder,
  IconGlobe,
  IconHeart,
  IconHome,
  IconLink,
  IconList,
  IconMail,
  IconMap,
  IconMessage,
  IconMicrophone,
  IconMusic,
  IconNotebook,
  IconPalette,
  IconPencil,
  IconPhone,
  IconPhoto,
  IconRocket,
  IconSchool,
  IconSearch,
  IconSettings,
  IconShoppingBag,
  IconStack2,
  IconStar,
  IconTag,
  IconTarget,
  IconTerminal,
  IconTrendingUp,
  IconUser,
  IconVideo,
  IconWallet,
} from "@tabler/icons-react";
import * as React from "react";

import type { Icon } from "@tabler/icons-react";

// 40개의 대표적인 아이콘
export const SPACE_ICONS: Array<{ name: string; icon: Icon }> = [
  { name: "book", icon: IconBook },
  { name: "bookmark", icon: IconBookmark },
  { name: "brain", icon: IconBrain },
  { name: "briefcase", icon: IconBriefcase },
  { name: "bulb", icon: IconBulb },
  { name: "calendar", icon: IconCalendar },
  { name: "camera", icon: IconCamera },
  { name: "chart-bar", icon: IconChartBar },
  { name: "code", icon: IconCode },
  { name: "coffee", icon: IconCoffee },
  { name: "cpu", icon: IconCpu },
  { name: "database", icon: IconDatabase },
  { name: "file", icon: IconFile },
  { name: "flame", icon: IconFlame },
  { name: "folder", icon: IconFolder },
  { name: "gamepad", icon: IconDeviceGamepad2 },
  { name: "globe", icon: IconGlobe },
  { name: "heart", icon: IconHeart },
  { name: "home", icon: IconHome },
  { name: "stack", icon: IconStack2 },
  { name: "link", icon: IconLink },
  { name: "list", icon: IconList },
  { name: "mail", icon: IconMail },
  { name: "map", icon: IconMap },
  { name: "message", icon: IconMessage },
  { name: "microphone", icon: IconMicrophone },
  { name: "music", icon: IconMusic },
  { name: "notebook", icon: IconNotebook },
  { name: "palette", icon: IconPalette },
  { name: "pencil", icon: IconPencil },
  { name: "phone", icon: IconPhone },
  { name: "photo", icon: IconPhoto },
  { name: "rocket", icon: IconRocket },
  { name: "school", icon: IconSchool },
  { name: "search", icon: IconSearch },
  { name: "settings", icon: IconSettings },
  { name: "shopping-bag", icon: IconShoppingBag },
  { name: "star", icon: IconStar },
  { name: "tag", icon: IconTag },
  { name: "target", icon: IconTarget },
  { name: "terminal", icon: IconTerminal },
  { name: "trending-up", icon: IconTrendingUp },
  { name: "user", icon: IconUser },
  { name: "video", icon: IconVideo },
  { name: "wallet", icon: IconWallet },
];

// 10가지 대표적인 색상 (Notion/Grok 스타일)
export const SPACE_COLORS: Array<{ name: string; value: string; bg: string }> =
  [
    { name: "gray", value: "#6B7280", bg: "bg-gray-500" },
    { name: "red", value: "#EF4444", bg: "bg-red-500" },
    { name: "orange", value: "#F97316", bg: "bg-orange-500" },
    { name: "amber", value: "#F59E0B", bg: "bg-amber-500" },
    { name: "green", value: "#22C55E", bg: "bg-green-500" },
    { name: "teal", value: "#14B8A6", bg: "bg-teal-500" },
    { name: "blue", value: "#3B82F6", bg: "bg-blue-500" },
    { name: "indigo", value: "#6366F1", bg: "bg-indigo-500" },
    { name: "purple", value: "#A855F7", bg: "bg-purple-500" },
    { name: "pink", value: "#EC4899", bg: "bg-pink-500" },
  ];

export function getIconByName(name: string): Icon {
  return SPACE_ICONS.find((i) => i.name === name)?.icon ?? IconBook;
}

export function getColorByName(
  name: string,
): (typeof SPACE_COLORS)[number] | undefined {
  return SPACE_COLORS.find((c) => c.name === name);
}

interface IconColorPickerProps {
  selectedIcon: string;
  selectedColor: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
}

export function IconColorPicker({
  selectedIcon,
  selectedColor,
  onIconChange,
  onColorChange,
}: IconColorPickerProps) {
  const [open, setOpen] = React.useState(false);

  const SelectedIconComponent = getIconByName(selectedIcon);
  const selectedColorData = getColorByName(selectedColor);

  return (
    <div className="flex flex-col items-start gap-3">
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger>
          <Button
            type="button"
            variant="ghost"
            className="size-8 p-0 rounded-xl transition-all"
            aria-label="아이콘 변경하기"
          >
            <SelectedIconComponent
              className="size-5"
              style={{ color: selectedColorData?.value }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0"
          align="start"
        >
          <div className="p-4 space-y-4">
            {/* 아이콘 섹션 */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                아이콘
              </div>
              <ScrollArea className="h-48">
                <div className="grid grid-cols-8 gap-1">
                  {SPACE_ICONS.map((item) => {
                    const IconComponent = item.icon;
                    const isSelected = selectedIcon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => onIconChange(item.name)}
                        className={`
                          flex items-center justify-center size-8 rounded-lg
                          transition-all duration-150
                          hover:bg-muted
                          ${isSelected ? "bg-primary/10 ring-2 ring-primary" : ""}
                        `}
                      >
                        <IconComponent
                          className="size-4"
                          style={{
                            color: isSelected
                              ? selectedColorData?.value
                              : undefined,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* 구분선 */}
            <div className="h-px bg-border" />

            {/* 색상 섹션 */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                색상
              </div>
              <div className="flex flex-wrap gap-2">
                {SPACE_COLORS.map((color) => {
                  const isSelected = selectedColor === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => onColorChange(color.name)}
                      className={`
                        size-7 rounded-full transition-all duration-150
                        hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-offset-background
                        ${isSelected ? "ring-2 ring-offset-2 ring-offset-background scale-110" : ""}
                      `}
                      style={
                        {
                          backgroundColor: color.value,
                          "--tw-ring-color": color.value,
                        } as React.CSSProperties
                      }
                      title={color.name}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Hidden inputs for form submission */}
      <input
        type="hidden"
        name="icon"
        value={selectedIcon}
      />
      <input
        type="hidden"
        name="color"
        value={selectedColor}
      />
    </div>
  );
}
