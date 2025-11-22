import type { ComponentProps, ReactNode } from "react";
import type { ButtonProps } from "../../button";

/**
 * Chatbot 루트 컴포넌트 Props
 */
export type ChatbotProps = ComponentProps<"div">;

/**
 * ChatbotHeader Props
 */
export type ChatbotHeaderProps = ComponentProps<"header">;

/**
 * ChatbotHeaderBackButton Props
 */
export type ChatbotHeaderBackButtonProps = Omit<ButtonProps, "children"> & {
  /**
   * 버튼 라벨 (스크린 리더용)
   * @default "뒤로 가기"
   */
  label?: string;
};

/**
 * ChatbotHeaderTitle Props
 */
export type ChatbotHeaderTitleProps = ComponentProps<"h1"> & {
  /**
   * 제목 텍스트
   */
  children: ReactNode;
};

/**
 * ChatbotHeaderActions Props
 */
export type ChatbotHeaderActionsProps = ComponentProps<"div"> & {
  /**
   * 액션 버튼들
   */
  children: ReactNode;
};

/**
 * ChatbotContent Props
 */
export type ChatbotContentProps = ComponentProps<"main">;
