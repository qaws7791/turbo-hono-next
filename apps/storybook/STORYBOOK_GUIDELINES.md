# Storybook Guidelines

This document outlines the principles and structure for writing Storybook stories for the `@repo/ui` components.

## Core Principles

### 1. Accessibility First

- All stories must demonstrate accessible usage patterns
- Include keyboard navigation examples
- Show form validation and error states
- Use semantic HTML and ARIA attributes properly

### 2. Component Variants Coverage

- Document all component variants and sizes
- Show interactive states (hover, focus, disabled, etc.)
- Demonstrate error and validation states for form components
- Include edge cases (long text, empty states, etc.)

### 3. Real-World Examples

- Provide practical usage examples
- Show composition patterns (e.g., Card with all sub-components)
- Include form integration examples where applicable
- Demonstrate common use cases

### 4. TypeScript Type Safety

- Use proper TypeScript types for all props
- Leverage discriminated unions for variant props
- Document required vs optional props clearly

## Story Structure

### File Organization

```
packages/ui/src/components/common/
  button.tsx
  button.stories.tsx        # Story file next to component
  checkbox.tsx
  checkbox.stories.tsx
```

### Story Template

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { ComponentName } from "@repo/ui/component-name";

const meta = {
  title: "Components/ComponentName",
  component: ComponentName,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    // Define controls for interactive props
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    // Default props
  },
};

// Variant stories
export const VariantName: Story = {
  args: {
    // Variant-specific props
  },
};

// Complex example stories
export const ComplexExample: Story = {
  render: () => (
    // Custom render for complex examples
  ),
};
```

## Component Categories

### 1. React Aria Components

**Examples**: Button, Checkbox, TextField, Select, DatePicker

**Key Characteristics**:

- Based on `react-aria-components`
- Use `composeRenderProps` for dynamic class composition
- Support form validation via `isInvalid`, `errorMessage`
- Provide both standalone and Form variants

**Story Requirements**:

- Show all variants and sizes
- Demonstrate interactive states (hover, focus, pressed)
- Include disabled state
- Show validation states (for form components)
- Demonstrate keyboard navigation
- Include Form wrapper examples (e.g., FormTextField)

### 2. Basic React Components

**Examples**: Card, Badge, LoadingSpinner, Icon

**Key Characteristics**:

- Standard React components
- Use `twMerge` for className composition
- May use compound component pattern
- No built-in validation

**Story Requirements**:

- Show all style variants
- Demonstrate composition patterns
- Include usage examples with other components
- Show responsive behavior where applicable

### 3. Complex Overlay Components

**Examples**: Dialog, Popover, Tooltip, Toast

**Key Characteristics**:

- Portal-based rendering
- Require trigger elements
- Support positioning and animations
- Manage focus and keyboard interactions

**Story Requirements**:

- Show trigger interactions
- Demonstrate different placements
- Include controlled and uncontrolled examples
- Show accessibility features (focus management, ESC to close)
- Provide real-world usage examples

## ArgTypes Best Practices

### Common Controls

```typescript
argTypes: {
  variant: {
    control: "select",
    options: ["primary", "secondary", "outline", "ghost"],
    description: "Visual style variant",
  },
  size: {
    control: "select",
    options: ["sm", "md", "lg"],
    description: "Component size",
  },
  isDisabled: {
    control: "boolean",
    description: "Whether the component is disabled",
  },
  children: {
    control: "text",
    description: "Content to render inside the component",
  },
}
```

### Form Components

```typescript
argTypes: {
  label: {
    control: "text",
    description: "Label text",
  },
  description: {
    control: "text",
    description: "Helper text",
  },
  errorMessage: {
    control: "text",
    description: "Error message",
  },
  isRequired: {
    control: "boolean",
    description: "Whether the field is required",
  },
  isInvalid: {
    control: "boolean",
    description: "Whether the field has an error",
  },
}
```

## Story Naming Conventions

- **Default**: Basic usage with default props
- **Variants**: One story per variant (Primary, Secondary, Outline, etc.)
- **Sizes**: One story per size (Small, Medium, Large)
- **States**: Interactive states (Disabled, Loading, Error, etc.)
- **WithIcon**: Components with icon integration
- **FormExample**: Form integration patterns
- **ComplexExample**: Real-world usage scenarios

## Documentation

### Component Description

Each story file should include:

- Brief component description
- Key features
- Accessibility notes
- Links to relevant documentation

### Props Documentation

Use JSDoc comments for auto-generated documentation:

```typescript
/**
 * Button component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation support
 * - ARIA attributes built-in
 * - Multiple variants and sizes
 * - Accessible by default
 *
 * @see https://react-spectrum.adobe.com/react-aria/Button.html
 */
```

## Testing Considerations

Stories should be written with testing in mind:

- Use clear and stable `data-testid` attributes
- Provide examples of user interactions
- Include edge cases
- Document expected behavior

## Accessibility Checklist

For each story, verify:

- [ ] Keyboard navigation works correctly
- [ ] Screen reader announcements are meaningful
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG standards
- [ ] Form validation is announced
- [ ] Interactive elements have proper roles and labels

## React Aria Components Specifics

### Render Props Pattern

Many React Aria Components use render props for dynamic styling:

```typescript
<Button className={composeRenderProps(className, (className, renderProps) =>
  buttonStyles({ ...renderProps, className })
)}>
  {children}
</Button>
```

Stories should demonstrate:

- How render props expose component state
- How to use `composeRenderProps` for custom styling
- Available render props (isHovered, isPressed, isDisabled, etc.)

### Form Integration

Show both standalone and form-integrated usage:

```typescript
// Standalone
<Checkbox>Accept terms</Checkbox>

// With form integration
<FormCheckboxGroup
  label="Preferences"
  description="Select your preferences"
  errorMessage="At least one option is required"
>
  <Checkbox value="option1">Option 1</Checkbox>
  <Checkbox value="option2">Option 2</Checkbox>
</FormCheckboxGroup>
```

## JollyUI Design Principles

Our components follow JollyUI patterns:

- Accessible by default via React Aria Components
- Styled with Tailwind CSS
- Support dark mode
- Use consistent spacing and sizing scales
- Follow shadcn/ui design language

## Examples

See existing stories for reference:

- Simple component: Button, Badge
- Form component: TextField, Checkbox
- Complex component: Card, Dialog
- Collection component: ListBox, Table

## Resources

- [React Aria Components](https://react-spectrum.adobe.com/react-aria/)
- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [JollyUI](https://www.jollyui.dev/docs)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
