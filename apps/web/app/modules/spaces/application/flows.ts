import * as React from "react";

import { useUpdateSpaceMutation } from "./mutations";

import type { SpaceDetail } from "../domain";

export function useSpaceAppearance(space: SpaceDetail): {
  selectedIcon: string;
  selectedColor: string;
  handleIconChange: (icon: string) => void;
  handleColorChange: (color: string) => void;
  saveAppearance: () => void;
  isSaving: boolean;
} {
  const updateSpace = useUpdateSpaceMutation();

  const initialIcon = space.icon ?? "book";
  const initialColor = space.color ?? "blue";

  const [selectedIcon, setSelectedIcon] = React.useState(initialIcon);
  const [selectedColor, setSelectedColor] = React.useState(initialColor);

  React.useEffect(() => {
    setSelectedIcon(initialIcon);
    setSelectedColor(initialColor);
  }, [initialColor, initialIcon, space.id]);

  const handleIconChange = (icon: string) => {
    setSelectedIcon(icon);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  // picker가 닫힐 때 호출 - 변경사항이 있을 때만 API 호출
  const saveAppearance = () => {
    if (selectedIcon === initialIcon && selectedColor === initialColor) return;

    updateSpace.mutate({
      spaceId: space.id,
      body: { icon: selectedIcon, color: selectedColor },
    });
  };

  return {
    selectedIcon,
    selectedColor,
    handleIconChange,
    handleColorChange,
    saveAppearance,
    isSaving: updateSpace.isPending,
  };
}
