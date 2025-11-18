"use client";

import { X } from "lucide-react";
import * as React from "react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  composeRenderProps,
} from "react-aria-components";

import { cn } from "../../../utils";

import { sheetVariants } from "./dialog.styles";

import type {
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogOverlayProps,
  DialogProps,
  DialogTitleProps,
  DialogTriggerProps,
} from "./dialog.types";

/**
 * Dialog component
 *
 * @description
 * The main dialog container. Built on React Aria Components for accessibility.
 *
 * @example
 * Basic usage (used internally by DialogContent)
 * ```tsx
 * <Dialog>
 *   <DialogHeader>
 *     <DialogTitle>Title</DialogTitle>
 *   </DialogHeader>
 * </Dialog>
 * ```
 */
export function Dialog(props: DialogProps) {
  return <AriaDialog {...props} />;
}

Dialog.displayName = "Dialog";

/**
 * DialogTrigger component
 *
 * @description
 * Wraps a trigger button and dialog content. Handles open/close state.
 *
 * @example
 * Basic usage
 * ```tsx
 * <DialogTrigger>
 *   <Button>Open Dialog</Button>
 *   <DialogOverlay>
 *     <DialogContent>
 *       <DialogHeader>
 *         <DialogTitle>Dialog Title</DialogTitle>
 *       </DialogHeader>
 *     </DialogContent>
 *   </DialogOverlay>
 * </DialogTrigger>
 * ```
 */
export function DialogTrigger(props: DialogTriggerProps) {
  return <AriaDialogTrigger {...props} />;
}

DialogTrigger.displayName = "DialogTrigger";

/**
 * DialogOverlay component
 *
 * @description
 * The backdrop/overlay behind the dialog. Handles click-outside-to-close.
 *
 * @example
 * Basic usage
 * ```tsx
 * <DialogOverlay>
 *   <DialogContent>
 *     Content here
 *   </DialogContent>
 * </DialogOverlay>
 * ```
 *
 * @example
 * Prevent dismissal
 * ```tsx
 * <DialogOverlay isDismissable={false}>
 *   <DialogContent closeButton={false}>
 *     Must click cancel button
 *   </DialogContent>
 * </DialogOverlay>
 * ```
 */
export function DialogOverlay({
  className,
  isDismissable = true,
  ...props
}: DialogOverlayProps) {
  return (
    <AriaModalOverlay
      isDismissable={isDismissable}
      className={composeRenderProps(className, (className) =>
        cn(
          "fixed inset-0 z-50 bg-black/80",
          /* Exiting */
          "data-[exiting]:duration-300 data-[exiting]:animate-out data-[exiting]:fade-out-0",
          /* Entering */
          "data-[entering]:animate-in data-[entering]:fade-in-0",
          className,
        ),
      )}
      {...props}
    />
  );
}

DialogOverlay.displayName = "DialogOverlay";

/**
 * DialogContent component
 *
 * @description
 * The modal/sheet content container. Supports both center modal and side sheet variants.
 *
 * @example
 * Center modal (default)
 * ```tsx
 * <DialogContent>
 *   <DialogHeader>
 *     <DialogTitle>Delete Account</DialogTitle>
 *     <DialogDescription>
 *       This action cannot be undone.
 *     </DialogDescription>
 *   </DialogHeader>
 *   <DialogFooter>
 *     <Button variant="destructive">Delete</Button>
 *   </DialogFooter>
 * </DialogContent>
 * ```
 *
 * @example
 * Side sheet
 * ```tsx
 * <DialogContent side="right">
 *   <DialogHeader>
 *     <DialogTitle>Settings</DialogTitle>
 *   </DialogHeader>
 *   Content here
 * </DialogContent>
 * ```
 */
export function DialogContent({
  className,
  children,
  side,
  role,
  closeButton = true,
  ...props
}: DialogContentProps) {
  return (
    <AriaModal
      className={composeRenderProps(className, (className) =>
        cn(
          side
            ? sheetVariants({ side, className: "h-full p-6" })
            : "fixed left-[50vw] top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border bg-background p-6 shadow-lg duration-200 data-[exiting]:duration-300 data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 sm:rounded-lg md:w-full",
          className,
        ),
      )}
      {...props}
    >
      <AriaDialog
        role={role}
        className={cn(!side && "grid h-full gap-4", "h-full outline-none")}
      >
        {composeRenderProps(children, (children, renderProps) => (
          <>
            {children}
            {closeButton && (
              <AriaButton
                onPress={renderProps.close}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[disabled]:pointer-events-none data-[entering]:bg-accent data-[entering]:text-muted-foreground data-[hovered]:opacity-100 data-[focused]:outline-none data-[focused]:ring-2 data-[focused]:ring-ring data-[focused]:ring-offset-2 p-2"
              >
                <X className="size-6" />
                <span className="sr-only">Close</span>
              </AriaButton>
            )}
          </>
        ))}
      </AriaDialog>
    </AriaModal>
  );
}

DialogContent.displayName = "DialogContent";

/**
 * DialogHeader component
 *
 * @description
 * Container for dialog title and description.
 *
 * @example
 * Basic usage
 * ```tsx
 * <DialogHeader>
 *   <DialogTitle>Confirm Action</DialogTitle>
 *   <DialogDescription>
 *     Are you sure you want to proceed?
 *   </DialogDescription>
 * </DialogHeader>
 * ```
 */
export function DialogHeader({
  className,
  ...props
}: DialogHeaderProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

DialogHeader.displayName = "DialogHeader";

/**
 * DialogFooter component
 *
 * @description
 * Container for dialog action buttons.
 *
 * @example
 * Basic usage
 * ```tsx
 * <DialogFooter>
 *   <Button variant="outline" onPress={close}>
 *     Cancel
 *   </Button>
 *   <Button onPress={handleConfirm}>
 *     Confirm
 *   </Button>
 * </DialogFooter>
 * ```
 */
export function DialogFooter({
  className,
  ...props
}: DialogFooterProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  );
}

DialogFooter.displayName = "DialogFooter";

/**
 * DialogTitle component
 *
 * @description
 * The dialog title heading.
 *
 * @example
 * Basic usage
 * ```tsx
 * <DialogTitle>Delete Account</DialogTitle>
 * ```
 */
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <AriaHeading
      slot="title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

DialogTitle.displayName = "DialogTitle";

/**
 * DialogDescription component
 *
 * @description
 * Descriptive text for the dialog.
 *
 * @example
 * Basic usage
 * ```tsx
 * <DialogDescription>
 *   This action cannot be undone. This will permanently delete your account.
 * </DialogDescription>
 * ```
 */
export function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps): React.ReactElement {
  return (
    <p
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

DialogDescription.displayName = "DialogDescription";
