"use client";

import { Form as AriaForm } from "react-aria-components";

import type { FormProps } from "./form.types";

/**
 * Form component
 *
 * @description
 * A form container component. Built on React Aria Components for accessibility.
 * Provides form validation and submission handling.
 *
 * @example
 * Basic usage
 * ```tsx
 * <Form onSubmit={(e) => {
 *   e.preventDefault();
 *   console.log('Form submitted');
 * }}>
 *   <TextField>
 *     <Label>Username</Label>
 *     <Input />
 *   </TextField>
 *   <Button type="submit">Submit</Button>
 * </Form>
 * ```
 *
 * @example
 * With validation
 * ```tsx
 * <Form validationErrors={{ username: 'Username is required' }}>
 *   <TextField name="username">
 *     <Label>Username</Label>
 *     <Input />
 *     <FieldError />
 *   </TextField>
 * </Form>
 * ```
 */
export function Form(props: FormProps) {
  return <AriaForm {...props} />;
}

Form.displayName = "Form";
