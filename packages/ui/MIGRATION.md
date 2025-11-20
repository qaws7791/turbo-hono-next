# Migration Guide for @repo/ui v1

This guide helps you migrate from the old flat component structure to the new organized structure with category-based imports.

## Overview of Changes

The `@repo/ui` package has been reorganized to improve maintainability and developer experience:

### Old Structure

```
packages/ui/src/
├── button.tsx
├── text-field.tsx
├── dialog.tsx
├── card.tsx
├── ...32 more components
```

### New Structure

```
packages/ui/src/components/
├── button/          # Button components
├── form/            # Form components
├── layout/          # Layout components
├── navigation/      # Navigation components
├── overlay/         # Dialog, Popover, Tooltip
├── date/            # Date components
├── feedback/        # Progress, Loading
├── display/         # Badge, Icon
├── interaction/     # Disclosure, ListBox
└── ai/              # AI components
```

## Breaking Changes

**None!** The old imports are maintained for backward compatibility. However, **we recommend migrating to the new import paths** for better code organization.

## Migration Steps

### Step 1: Understand Import Path Changes

#### Before (Old Flat Structure)

```tsx
import { Button } from "@repo/ui/button";
import { TextField } from "@repo/ui/text-field";
import { Dialog } from "@repo/ui/dialog";
import { Card } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Link } from "@repo/ui/link";
```

#### After (New Category-Based Structure)

```tsx
import { Button } from "@repo/ui/button"; // Same path (aliased)
import { TextField } from "@repo/ui/text-field"; // Same path (aliased)
import { Dialog } from "@repo/ui/dialog"; // Same path (aliased)
import { Card } from "@repo/ui/layout"; // Changed category
import { Badge } from "@repo/ui/display"; // Changed category
import { Link } from "@repo/ui/navigation"; // Changed category
```

#### Recommended (Import from Categories)

```tsx
import { Button, ButtonGroup } from "@repo/ui/button";
import { TextField, NumberField, Select } from "@repo/ui/form";
import { Dialog, Popover, Tooltip } from "@repo/ui/overlay";
import { Card, Separator, Sidebar } from "@repo/ui/layout";
import { Badge, Icon } from "@repo/ui/display";
import { Link, Menu, Tabs } from "@repo/ui/navigation";
```

### Step 2: Update Component Imports

Use this reference to find new import paths for each component:

#### Form Components

| Component       | Old Import                  | Category Import                    |
| --------------- | --------------------------- | ---------------------------------- |
| TextField       | `@repo/ui/text-field`       | `@repo/ui/form`                    |
| NumberField     | `@repo/ui/number-field`     | `@repo/ui/form`                    |
| SearchField     | `@repo/ui/search-field`     | `@repo/ui/form`                    |
| Checkbox        | `@repo/ui/checkbox`         | `@repo/ui/form`                    |
| RadioGroup      | `@repo/ui/radio-group`      | `@repo/ui/form`                    |
| Select          | `@repo/ui/select`           | `@repo/ui/form`                    |
| Slider          | `@repo/ui/slider`           | `@repo/ui/form`                    |
| Switch          | `@repo/ui/switch`           | `@repo/ui/form`                    |
| DateField       | `@repo/ui/date-field`       | `@repo/ui/form` or `@repo/ui/date` |
| Label           | `@repo/ui/label`            | `@repo/ui/form`                    |
| FieldError      | `@repo/ui/field-error`      | `@repo/ui/form`                    |
| FormDescription | `@repo/ui/form-description` | `@repo/ui/form`                    |
| FieldGroup      | `@repo/ui/field-group`      | `@repo/ui/form`                    |
| Form            | `@repo/ui/form`             | `@repo/ui/form`                    |
| InputGroup      | `@repo/ui/input-group`      | `@repo/ui/form`                    |

#### Layout Components

| Component  | Old Import             | Category Import   |
| ---------- | ---------------------- | ----------------- |
| Card       | `@repo/ui/card`        | `@repo/ui/layout` |
| Separator  | `@repo/ui/separator`   | `@repo/ui/layout` |
| Sidebar    | `@repo/ui/sidebar`     | `@repo/ui/layout` |
| ScrollArea | `@repo/ui/scroll-area` | `@repo/ui/layout` |

#### Navigation Components

| Component | Old Import      | Category Import       |
| --------- | --------------- | --------------------- |
| Link      | `@repo/ui/link` | `@repo/ui/navigation` |
| Menu      | `@repo/ui/menu` | `@repo/ui/navigation` |
| Tabs      | `@repo/ui/tabs` | `@repo/ui/navigation` |

#### Overlay Components

| Component | Old Import         | Category Import    |
| --------- | ------------------ | ------------------ |
| Dialog    | `@repo/ui/dialog`  | `@repo/ui/overlay` |
| Popover   | `@repo/ui/popover` | `@repo/ui/overlay` |
| Tooltip   | `@repo/ui/tooltip` | `@repo/ui/overlay` |
| Toast     | `@repo/ui/toast`   | `@repo/ui/toast`   |

#### Date Components

| Component  | Old Import             | Category Import |
| ---------- | ---------------------- | --------------- |
| DatePicker | `@repo/ui/date-picker` | `@repo/ui/date` |
| Calendar   | `@repo/ui/calendar`    | `@repo/ui/date` |
| DateField  | `@repo/ui/date-field`  | `@repo/ui/date` |

#### Button Components

| Component   | Old Import              | Category Import   |
| ----------- | ----------------------- | ----------------- |
| Button      | `@repo/ui/button`       | `@repo/ui/button` |
| ButtonGroup | `@repo/ui/button-group` | `@repo/ui/button` |

#### Feedback Components

| Component      | Old Import                 | Category Import     |
| -------------- | -------------------------- | ------------------- |
| ProgressBar    | `@repo/ui/progress-bar`    | `@repo/ui/feedback` |
| LoadingSpinner | `@repo/ui/loading-spinner` | `@repo/ui/feedback` |

#### Display Components

| Component | Old Import       | Category Import    |
| --------- | ---------------- | ------------------ |
| Badge     | `@repo/ui/badge` | `@repo/ui/display` |
| Icon      | `@repo/ui/icon`  | `@repo/ui/display` |

#### Interaction Components

| Component  | Old Import            | Category Import        |
| ---------- | --------------------- | ---------------------- |
| Disclosure | `@repo/ui/disclosure` | `@repo/ui/interaction` |
| ListBox    | `@repo/ui/list-box`   | `@repo/ui/interaction` |

#### AI Components

| Component         | Old Import                        | Category Import |
| ----------------- | --------------------------------- | --------------- |
| Conversation      | `@repo/ui/ai/conversation`        | `@repo/ui/ai`   |
| Message           | `@repo/ui/ai/message`             | `@repo/ui/ai`   |
| PromptInput       | `@repo/ui/ai/prompt-input`        | `@repo/ui/ai`   |
| ToolExecutionCard | `@repo/ui/ai/tool-execution-card` | `@repo/ui/ai`   |
| ToolInvocation    | `@repo/ui/ai/tool-invocation`     | `@repo/ui/ai`   |
| ToolResults       | `@repo/ui/ai/tool-results`        | `@repo/ui/ai`   |

### Step 3: Example Migration

Here's a practical example of updating your imports:

#### Before

```tsx
// pages/user-profile.tsx
import { Card } from "@repo/ui/card";
import { TextField } from "@repo/ui/text-field";
import { Button } from "@repo/ui/button";
import { Select } from "@repo/ui/select";
import { Badge } from "@repo/ui/badge";
import { Link } from "@repo/ui/link";
import { Dialog } from "@repo/ui/dialog";
```

#### After (Option A - Individual Imports)

```tsx
// pages/user-profile.tsx
import { Card } from "@repo/ui/layout";
import { TextField } from "@repo/ui/form";
import { Button } from "@repo/ui/button";
import { Select } from "@repo/ui/form";
import { Badge } from "@repo/ui/display";
import { Link } from "@repo/ui/navigation";
import { Dialog } from "@repo/ui/overlay";
```

#### After (Option B - Category Imports - Recommended)

```tsx
// pages/user-profile.tsx
import { Card } from "@repo/ui/layout";
import { TextField, Select } from "@repo/ui/form";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/display";
import { Link } from "@repo/ui/navigation";
import { Dialog } from "@repo/ui/overlay";
```

#### After (Option C - All from Root - Not Recommended)

```tsx
// pages/user-profile.tsx
// Only recommended for simple usage
import { Card, TextField, Button, Select, Badge, Link, Dialog } from "@repo/ui";
```

### Step 4: Automated Migration (if using TypeScript)

If you're using TypeScript with strict import checking, you can:

1. **Update one import path at a time** and verify it works
2. **Use IDE refactoring** (e.g., VSCode's Find and Replace with regex)
3. **Use a code codemod** (advanced)

Example regex replacements:

```
# Find and replace in VSCode
Find:  import { ([^}]+) } from "@repo/ui/text-field"
Replace: import { $1 } from "@repo/ui/form"

Find:  import { ([^}]+) } from "@repo/ui/card"
Replace: import { $1 } from "@repo/ui/layout"

Find:  import { ([^}]+) } from "@repo/ui/badge"
Replace: import { $1 } from "@repo/ui/display"
```

### Step 5: Update Type Imports

Also update type imports if you're using them:

#### Before

```tsx
import type { TextFieldProps } from "@repo/ui/text-field";
import type { ButtonProps } from "@repo/ui/button";
```

#### After

```tsx
import type { TextFieldProps } from "@repo/ui/form";
import type { ButtonProps } from "@repo/ui/button";
```

### Step 6: Utilities and Types

Utility and type imports remain the same:

```tsx
// Utilities - No change needed
import { cn } from "@repo/ui/utils";

// Types - No change needed
import type { BaseComponentProps } from "@repo/ui/types";

// Styles - No change needed
import { buttonStyles } from "@repo/ui/styles";
```

## Common Patterns

### Pattern 1: Form Component Groups

```tsx
// Group all form components together
import {
  Form,
  Label,
  TextField,
  NumberField,
  Select,
  Checkbox,
  RadioGroup,
  Button,
} from "@repo/ui/form";

export function SignupForm() {
  return (
    <Form onSubmit={handleSubmit}>
      <Label htmlFor="email">Email</Label>
      <TextField
        id="email"
        isRequired
      />

      <Label htmlFor="role">Role</Label>
      <Select id="role">
        <option>Developer</option>
        <option>Designer</option>
      </Select>

      <Checkbox>I agree to terms</Checkbox>
      <Button
        variant="primary"
        type="submit"
      >
        Sign Up
      </Button>
    </Form>
  );
}
```

### Pattern 2: Dialog with Form

```tsx
import { Dialog } from "@repo/ui/overlay";
import { Form, TextField, Button } from "@repo/ui/form";

export function EditDialog({ isOpen, onOpenChange }) {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          isRequired
        />
        <Button type="submit">Save</Button>
      </Form>
    </Dialog>
  );
}
```

### Pattern 3: Layout with Navigation

```tsx
import { Sidebar, Card, Separator } from "@repo/ui/layout";
import { Tabs, Link } from "@repo/ui/navigation";
import { Button } from "@repo/ui/button";

export function Dashboard() {
  return (
    <div className="flex">
      <Sidebar>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/settings">Settings</Link>
      </Sidebar>
      <Card className="flex-1">
        <Tabs>
          <TabPanel>Content 1</TabPanel>
          <TabPanel>Content 2</TabPanel>
        </Tabs>
      </Card>
    </div>
  );
}
```

## Gradual Migration Strategy

You **don't need to migrate everything at once**. Here's a recommended approach:

### Phase 1: High-Priority Files (Week 1)

- Update main app entry point
- Update page/route files
- Update layout components
- Update commonly used feature files

### Phase 2: Medium-Priority Files (Week 2)

- Update feature-specific components
- Update utility files
- Update hook files

### Phase 3: Low-Priority Files (Week 3+)

- Update test files
- Update story files
- Update less frequently used components

## Deprecation Timeline

| Timeline | Status                                                    |
| -------- | --------------------------------------------------------- |
| **Now**  | Old imports work (backward compatible)                    |
| **v1.x** | Old imports work but show deprecation warnings in console |
| **v2.0** | Old imports may be removed; use new paths only            |

## Troubleshooting

### Issue: "Module not found" error after updating imports

**Solution**: Ensure you're importing from the correct category:

```tsx
// ❌ Wrong
import { Card } from "@repo/ui/form";

// ✅ Correct
import { Card } from "@repo/ui/layout";
```

### Issue: Type definitions not found

**Solution**: Ensure you're using the correct type import:

```tsx
// ❌ Wrong
import type { CardProps } from "@repo/ui/card";

// ✅ Correct
import type { CardProps } from "@repo/ui/layout";
```

### Issue: Duplicate component imports

**Solution**: Consolidate imports from the same category:

```tsx
// ❌ Redundant
import { TextField } from "@repo/ui/form";
import { Select } from "@repo/ui/form";

// ✅ Better
import { TextField, Select } from "@repo/ui/form";
```

## Getting Help

- See [README.md](./README.md) for general component documentation
- Check individual component JSDoc comments for detailed API information
- Review Storybook stories for component usage examples
- Open an issue if you encounter problems during migration

## Summary

The new component organization improves code clarity and maintainability. The old import paths are still supported for backward compatibility, but we recommend updating to the new category-based imports as part of your development workflow.

Happy migrating! 🚀
