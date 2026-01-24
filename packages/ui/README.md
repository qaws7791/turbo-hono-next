# @repo/ui

A comprehensive, accessible React component library built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html) and styled with [Tailwind CSS](https://tailwindcss.com/).

## Features

- **Accessible by Default**: Built on React Aria Components with WCAG 2.1 compliance
- **Type-Safe**: Full TypeScript support with strict typing
- **Customizable**: Tailwind CSS v4 for styling
- **Well-Documented**: JSDoc comments and comprehensive examples
- **Organized**: Components grouped by functionality (form, layout, navigation, etc.)
- **Modular**: Import only what you need

## Installation

```bash
pnpm add @repo/ui
```

## Quick Start

### Basic Button

```tsx
import { Button } from "@repo/ui/button";

export function App() {
  return (
    <Button
      variant="primary"
      size="md"
      onPress={() => console.log("Clicked")}
    >
      Click me
    </Button>
  );
}
```

### Form Components

```tsx
import { TextField } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { Form } from "@repo/ui/form";

export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        isRequired
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        isRequired
      />
      <Button
        variant="primary"
        type="submit"
      >
        Sign In
      </Button>
    </Form>
  );
}
```

### Dialog Component

```tsx
import { Dialog } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";

export function Confirmation() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Open Dialog</Button>
      <Dialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <h2>Confirm Action</h2>
        <p>Are you sure?</p>
        <Button
          variant="destructive"
          onPress={() => setIsOpen(false)}
        >
          Confirm
        </Button>
      </Dialog>
    </>
  );
}
```

## Component Categories

### Form Components

Complete form solution with validation support.

- **TextField** - Single-line text input
- **NumberField** - Numeric input
- **SearchField** - Search input with clearing
- **Checkbox** - Checkbox control
- **RadioGroup** - Radio button group
- **Select** - Dropdown selection
- **Slider** - Range slider
- **Switch** - Toggle switch
- **DateField** - Date input
- **Label** - Form label
- **FieldError** - Error message display
- **FormDescription** - Field description
- **FieldGroup** - Group related fields
- **Form** - Form container with submission handling

**Import example:**

import { TextField, Select, Button } from "@repo/ui/form";
// or
import { Form } from "@repo/ui/form";
import { TextField, Select } from "@repo/ui/input";

### Layout Components

Components for page structure and spacing.

- **Card** - Content container
- **Separator** - Visual divider
- **Sidebar** - Collapsible sidebar
- **ScrollArea** - Scrollable content region

**Import example:**

```tsx
import { Card, Separator, Sidebar } from "@repo/ui/layout";
```

### Navigation Components

Components for navigation and routing.

- **Link** - Navigation link
- **Menu** - Dropdown menu
- **Tabs** - Tabbed content

**Import example:**

```tsx
import { Link, Menu, Tabs } from "@repo/ui/navigation";
```

### Overlay Components

Components for dialogs, popovers, and tooltips.

- **Dialog** - Modal dialog
- **Popover** - Popup content
- **Tooltip** - Hover tooltip

**Import example:**

```tsx
import { Dialog, Popover, Tooltip } from "@repo/ui/overlay";
```

### Date Components

Components for date selection.

- **DateField** - Date input field
- **DatePicker** - Date selection popup
- **Calendar** - Calendar widget

**Import example:**

```tsx
import { DatePicker, Calendar } from "@repo/ui/date";
```

### Button Components

Button variants and groups.

- **Button** - Primary button component
- **ButtonGroup** - Grouped buttons

**Import example:**

```tsx
import { Button, ButtonGroup } from "@repo/ui/button";
```

### Feedback Components

Components for user feedback.

- **ProgressBar** - Progress indicator
- **LoadingSpinner** - Loading animation

**Import example:**

```tsx
import { ProgressBar, LoadingSpinner } from "@repo/ui/feedback";
```

### Display Components

Components for displaying content.

- **Badge** - Label badge
- **Icon** - Icon display

**Import example:**

```tsx
import { Badge, Icon } from "@repo/ui/display";
```

### Interaction Components

Components for interactive elements.

- **Disclosure** - Expandable section
- **ListBox** - List selection

**Import example:**

```tsx
import { Disclosure, ListBox } from "@repo/ui/interaction";
```

### AI Components

Components for AI-powered features.

- **Conversation** - Chat conversation display
- **Message** - Individual message
- **PromptInput** - Prompt input area
- **ToolExecutionCard** - Tool execution display
- **ToolInvocation** - Tool invocation display
- **ToolResults** - Tool results display

**Import example:**

```tsx
import { Conversation, Message, PromptInput } from "@repo/ui/ai";
```

## Import Patterns

### Category Import (Recommended)

Import multiple components from a category at once:

```tsx
import { Button, ButtonGroup } from "@repo/ui/button";
import { TextField, Select, Checkbox } from "@repo/ui/form";
import { Dialog, Tooltip, Popover } from "@repo/ui/overlay";
```

### Individual Component Import

Import specific components directly:

```tsx
import { Button } from "@repo/ui/button";
import { TextField } from "@repo/ui/text-field";
import { Dialog } from "@repo/ui/dialog";
```

### All Components Import (Not Recommended)

Importing from the root package is supported but **not recommended** for production as it can lead to larger bundle sizes:

```tsx
import { Button, TextField, Dialog, Card, Badge } from "@repo/ui";
```

### Utilities and Types

Import utilities and type definitions:

```tsx
import { cn } from "@repo/ui/utils"; // className utility
import type { BaseComponentProps } from "@repo/ui/types"; // Base prop types
import { buttonStyles } from "@repo/ui/styles"; // Style variants
```

## Styling

### Using Tailwind CSS

All components are styled with Tailwind CSS and support the `className` prop:

```tsx
<Button className="w-full uppercase">Full Width Button</Button>
<Card className="shadow-lg border-2">Content</Card>
```

### Customizing Variants

Use the exported `variants` to create custom component variants:

```tsx
import { buttonStyles } from "@repo/ui/styles";

const customButton = buttonStyles({ variant: "destructive", size: "lg" });
// Use in your own component
<button className={customButton}>Delete</button>;
```

### CSS Stylesheet

Import the component styles:

```tsx
import "@repo/ui/components.css"; // Component styles
import "@repo/ui/theme.css"; // Theme variables
```

## API Reference

### Button

```tsx
interface ButtonProps extends Aria.ButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
}
```

### TextField

```tsx
interface TextFieldProps extends Aria.TextFieldProps {
  label?: string;
  errorMessage?: string;
  description?: string;
  isRequired?: boolean;
}
```

### Dialog

```tsx
interface DialogProps extends Aria.DialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}
```

For complete type definitions, see individual component `.types.ts` files.

## Accessibility

All components are built on React Aria Components and follow WCAG 2.1 guidelines:

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, Space, Arrow keys
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Clear focus indicators (focus ring)
- **Color Contrast**: WCAG AA compliant (4.5:1 minimum)
- **Error Handling**: Clear error messages and validation feedback

## Development

### Building

```bash
# Build Tailwind CSS
pnpm --filter @repo/ui build

# Watch mode
pnpm --filter @repo/ui dev
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

### Storybook

Develop and test components in isolation:

```bash
pnpm --filter storybook dev
```

## Migration Guide

If you're upgrading from the old flat component structure, see [MIGRATION.md](./MIGRATION.md) for detailed instructions on updating import paths.

## Contributing

Contributions are welcome! Please ensure:

- All components follow the established patterns
- TypeScript types are strictly defined
- JSDoc comments are provided
- Accessibility guidelines are met
- Storybook stories are created/updated

## License

See LICENSE file for details.

## Resources

- [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html)
- [Tailwind CSS](https://tailwindcss.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
