import { useSuspenseQuery } from "@tanstack/react-query";

import { useUpdateSpaceMutation } from "../application";
import { spacesQueries } from "../spaces.queries";

import { IconColorPicker } from "./icon-color-picker";

interface SpaceIconEditorProps {
  spaceId: string;
}

/**
 * 스페이스의 아이콘과 색상을 편집하는 스마트 컴포넌트
 *
 * 내부적으로 스페이스 데이터를 조회하고, 아이콘/색상 변경 시
 * 자동으로 서버에 업데이트를 수행합니다.
 */
export function SpaceIconEditor({ spaceId }: SpaceIconEditorProps) {
  const { data: space } = useSuspenseQuery(spacesQueries.detail(spaceId));
  const { updateSpace } = useUpdateSpaceMutation();

  const currentIcon = space.icon ?? "book";
  const currentColor = space.color ?? "blue";

  const handleIconChange = (icon: string) => {
    updateSpace(spaceId, { icon, color: currentColor });
  };

  const handleColorChange = (color: string) => {
    updateSpace(spaceId, { icon: currentIcon, color });
  };

  return (
    <IconColorPicker
      selectedIcon={currentIcon}
      selectedColor={currentColor}
      onIconChange={handleIconChange}
      onColorChange={handleColorChange}
    />
  );
}
