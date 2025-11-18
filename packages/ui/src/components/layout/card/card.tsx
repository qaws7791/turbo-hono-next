import * as React from "react";

import { cn } from "../../../utils";

import type {
  CardActionProps,
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
} from "./card.types";

/**
 * Card component - Container for related content
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     Card content goes here
 *   </CardContent>
 * </Card>
 * ```
 */
function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6",
        className,
      )}
      {...props}
    />
  );
}

/**
 * CardHeader component - Header section of card
 *
 * @example
 * ```tsx
 * <CardHeader>
 *   <CardTitle>Title</CardTitle>
 *   <CardDescription>Description</CardDescription>
 *   <CardAction>
 *     <Button>Action</Button>
 *   </CardAction>
 * </CardHeader>
 * ```
 */
function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

/**
 * CardTitle component - Main title in card header
 *
 * @example
 * ```tsx
 * <CardTitle>Card Title</CardTitle>
 * ```
 */
function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

/**
 * CardDescription component - Description text in card header
 *
 * @example
 * ```tsx
 * <CardDescription>This is a description</CardDescription>
 * ```
 */
function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

/**
 * CardAction component - Action buttons in card header
 *
 * @example
 * ```tsx
 * <CardAction>
 *   <Button>Edit</Button>
 * </CardAction>
 * ```
 */
function CardAction({ className, ...props }: CardActionProps) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

/**
 * CardContent component - Main content area of card
 *
 * @example
 * ```tsx
 * <CardContent>
 *   <p>Card content goes here</p>
 * </CardContent>
 * ```
 */
function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

/**
 * CardFooter component - Footer section of card
 *
 * @example
 * ```tsx
 * <CardFooter>
 *   <Button>Submit</Button>
 * </CardFooter>
 * ```
 */
function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
