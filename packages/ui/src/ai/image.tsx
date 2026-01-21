import type { Experimental_GeneratedImage } from "ai";

import { cn } from "@/utils";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = ({
  base64,
  // <img> 태그에 불필요한 속성이 전달되지 않도록 props에서 제외합니다.
  uint8Array: _uint8Array,
  mediaType,
  ...props
}: ImageProps) => {
  void _uint8Array;

  return (
    <img
      {...props}
      alt={props.alt}
      className={cn(
        "h-auto max-w-full overflow-hidden rounded-md",
        props.className,
      )}
      src={`data:${mediaType};base64,${base64}`}
    />
  );
};
