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
} from "react-aria-components";

import { Button } from "../../button";

import { toastRegionStyles, toastStyles } from "./toast.styles";

import type { QueuedToast } from "react-aria-components";
import type { ToastContent } from "./toast.types";

const toastIconMap = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
} as const;

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

/**
 * Toast component - Displays temporary notification messages
 *
 * @example
 * ```tsx
 * import { Toast, toast } from "@repo/ui";
 *
 * // In your root layout or app
 * <Toast />
 *
 * // Trigger toasts from anywhere
 * toast.success({ title: "Success!", description: "Your changes have been saved." });
 * toast.error({ title: "Error", description: "Something went wrong." });
 * toast.info({ title: "Info", description: "New updates available." });
 * ```
 */
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

/**
 * Toast utility object with methods to trigger different types of toasts
 */
const toast = {
  /** Show a success toast */
  success: (content: Omit<ToastContent, "variant">) =>
    queue.add({ ...content, variant: "success" }, { timeout: 5000 }),
  /** Show an error toast */
  error: (content: Omit<ToastContent, "variant">) =>
    queue.add({ ...content, variant: "destructive" }, { timeout: 8000 }),
  /** Show a warning toast */
  warning: (content: Omit<ToastContent, "variant">) =>
    queue.add({ ...content, variant: "warning" }, { timeout: 6000 }),
  /** Show an info toast */
  info: (content: Omit<ToastContent, "variant">) =>
    queue.add({ ...content, variant: "info" }, { timeout: 5000 }),
  /** Show a default toast */
  default: (content: Omit<ToastContent, "variant">) =>
    queue.add({ ...content, variant: "default" }, { timeout: 5000 }),
  /** Direct add method for custom usage */
  add: (content: ToastContent, options?: { timeout?: number }) =>
    queue.add(content, { timeout: 5000, ...options }),
};

/**
 * Add a toast to the queue
 */
const addToast = (content: ToastContent, options?: { timeout?: number }) =>
  queue.add(content, { timeout: 5000, ...options });

/**
 * Remove a toast from the queue by key
 */
const removeToast = (key: string) => queue.close(key);

/**
 * Pause all active toasts
 */
const pauseAll = () => queue.pauseAll();

/**
 * Resume all paused toasts
 */
const resumeAll = () => queue.resumeAll();

export { addToast, pauseAll, removeToast, resumeAll, toast, Toast };
