"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import {
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastQueue as AriaToastQueue,
  UNSTABLE_ToastRegion as AriaToastRegion,
  QueuedToast,
} from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { focusRing } from "../utils";
import { Button } from "./button";

const toastRegionStyles = tv({
  base: [
    "fixed top-4 right-4 z-50 w-full max-w-sm space-y-2",
    "flex flex-col gap-2",
  ],
});

const toastStyles = tv({
  extend: focusRing,
  base: [
    "group relative flex items-center gap-3 overflow-hidden rounded-lg border p-4 shadow-lg",
    "transition-all duration-300 ease-in-out",
    /* Animation States */
    "data-[entering]:animate-in data-[entering]:slide-in-from-right-full",
    "data-[exiting]:animate-out data-[exiting]:slide-out-to-right-full",
  ],
  variants: {
    variant: {
      default: "border-border bg-background text-foreground",
      destructive: "border-destructive/20 bg-destructive/10 text-destructive",
      success: "border-green-200 bg-green-50 text-green-800",
      warning: "border-amber-200 bg-amber-50 text-amber-800",
      info: "border-blue-200 bg-blue-50 text-blue-800",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const toastIconMap = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
} as const;

// Toast content interface for queue
interface ToastContent {
  title?: string;
  description?: string;
  variant?: VariantProps<typeof toastStyles>["variant"];
  action?: {
    label: string;
    onClick: () => void;
  };
}

const queue = new AriaToastQueue<ToastContent>();

const ToastCard = (props: QueuedToast<ToastContent>) => {
  const { title, description, variant, action } = props.content;

  const IconComponent = toastIconMap[variant || "default"];
  return (
    <AriaToast
      toast={props}
      className={toastStyles({ variant })}
    >
      <IconComponent className="h-5 w-5 shrink-0" />

      <div className="flex-1 space-y-1">
        {title && <div className="font-medium text-sm">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>

      <div className="flex items-center gap-2">
        {action && (
          <Button
            variant="outline"
            size="sm"
            onPress={action.onClick}
            className="h-8 px-3 text-xs"
          >
            {action.label}
          </Button>
        )}

        <Button
          slot="close"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-black/10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">닫기</span>
        </Button>
      </div>
    </AriaToast>
  );
};

const Toast = () => {
  return (
    <AriaToastRegion
      queue={queue}
      className={toastRegionStyles()}
    >
      {({ toast }) => {
        return <ToastCard {...toast} />;
      }}
    </AriaToastRegion>
  );
};

Toast.displayName = "Toast";

const toast = {
  success: (content: Omit<ToastContent, "variant">) =>
    queue.add({ ...content, variant: "success" }, { timeout: 5000 }),
  error: (content: Omit<ToastContent, "variant">) =>
    queue.add({ ...content, variant: "destructive" }, { timeout: 8000 }),
  warning: (content: Omit<ToastContent, "variant">) =>
    queue.add({ ...content, variant: "warning" }, { timeout: 6000 }),
  info: (content: Omit<ToastContent, "variant">) =>
    queue.add({ ...content, variant: "info" }, { timeout: 5000 }),
  default: (content: Omit<ToastContent, "variant">) =>
    queue.add({ ...content, variant: "default" }, { timeout: 5000 }),
  // Direct add method for custom usage
  add: (content: ToastContent, options?: { timeout?: number }) =>
    queue.add(content, { timeout: 5000, ...options }),
};

const addToast = (content: ToastContent, options?: { timeout?: number }) =>
  queue.add(content, { timeout: 5000, ...options });

const removeToast = (key: string) => queue.close(key);

const pauseAll = () => queue.pauseAll();
const resumeAll = () => queue.resumeAll();

export {
  addToast,
  pauseAll,
  removeToast,
  resumeAll,
  toast,
  Toast,
  toastRegionStyles,
  toastStyles,
};
