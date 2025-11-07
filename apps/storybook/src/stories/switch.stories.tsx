import { Switch } from "@repo/ui/switch";
import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Switch component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation support (Space/Enter to toggle)
 * - ARIA attributes built-in for accessibility
 * - Visual feedback for on/off states
 * - Smooth toggle animation
 * - Supports disabled and readonly states
 * - Accessible by default
 *
 * Common use cases:
 * - Enable/disable features
 * - Notification settings
 * - Privacy toggles
 * - App preferences
 *
 * @see https://react-spectrum.adobe.com/react-aria/Switch.html
 */
const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "Label text for the switch",
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the switch is disabled",
    },
    isSelected: {
      control: "boolean",
      description: "Whether the switch is on (selected)",
    },
    isReadOnly: {
      control: "boolean",
      description: "Whether the switch is read-only",
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default switch with label
 */
export const Default: Story = {
  args: {
    children: "Enable notifications",
  },
};

/**
 * Switch in on state
 */
export const On: Story = {
  args: {
    children: "Switch On",
    isSelected: true,
  },
};

/**
 * Switch in off state
 */
export const Off: Story = {
  args: {
    children: "Switch Off",
    isSelected: false,
  },
};

/**
 * Disabled switch
 */
export const Disabled: Story = {
  args: {
    children: "Disabled switch",
    isDisabled: true,
  },
};

/**
 * Disabled and on
 */
export const DisabledOn: Story = {
  args: {
    children: "Disabled On",
    isDisabled: true,
    isSelected: true,
  },
};

/**
 * Read-only switch
 */
export const ReadOnly: Story = {
  args: {
    children: "Read-only switch",
    isReadOnly: true,
    isSelected: true,
  },
};

/**
 * Switch without label
 */
export const WithoutLabel: Story = {
  args: {},
};

/**
 * All states showcase
 */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch>Off</Switch>
      <Switch isSelected>On</Switch>
      <Switch isDisabled>Disabled Off</Switch>
      <Switch
        isDisabled
        isSelected
      >
        Disabled On
      </Switch>
      <Switch
        isReadOnly
        isSelected
      >
        Read-only
      </Switch>
    </div>
  ),
};

/**
 * Controlled switch
 */
export const Controlled: Story = {
  render: () => {
    const [isEnabled, setIsEnabled] = React.useState(false);

    return (
      <div className="space-y-4">
        <Switch
          isSelected={isEnabled}
          onChange={setIsEnabled}
        >
          Enable feature
        </Switch>
        <div className="rounded-md bg-muted p-4">
          <p className="text-sm font-medium">
            Feature is: {isEnabled ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Settings panel example
 */
export const SettingsPanel: Story = {
  render: () => (
    <div className="w-[400px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Notification Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Email notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive email updates
            </p>
          </div>
          <Switch defaultSelected />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Push notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive push notifications
            </p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">SMS notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive text messages
            </p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  ),
};

/**
 * Privacy settings example
 */
export const PrivacySettings: Story = {
  render: () => (
    <div className="w-[400px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Privacy Settings</h2>
      <div className="space-y-4">
        <Switch defaultSelected>Make profile public</Switch>
        <Switch defaultSelected>
          Allow search engines to index my profile
        </Switch>
        <Switch>Show online status</Switch>
        <Switch>Allow others to see my activity</Switch>
      </div>
    </div>
  ),
};

/**
 * Feature toggles example
 */
export const FeatureToggles: Story = {
  render: () => {
    const [features, setFeatures] = React.useState({
      darkMode: true,
      animations: true,
      sounds: false,
      beta: false,
    });

    return (
      <div className="w-[400px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Features</h2>
        <div className="space-y-4">
          <Switch
            isSelected={features.darkMode}
            onChange={(selected) =>
              setFeatures((prev) => ({ ...prev, darkMode: selected }))
            }
          >
            Dark mode
          </Switch>
          <Switch
            isSelected={features.animations}
            onChange={(selected) =>
              setFeatures((prev) => ({ ...prev, animations: selected }))
            }
          >
            Enable animations
          </Switch>
          <Switch
            isSelected={features.sounds}
            onChange={(selected) =>
              setFeatures((prev) => ({ ...prev, sounds: selected }))
            }
          >
            Sound effects
          </Switch>
          <Switch
            isSelected={features.beta}
            onChange={(selected) =>
              setFeatures((prev) => ({ ...prev, beta: selected }))
            }
          >
            Beta features
          </Switch>
        </div>
      </div>
    );
  },
};

/**
 * With description text
 */
export const WithDescription: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div className="space-y-2">
        <Switch defaultSelected>Marketing emails</Switch>
        <p className="text-sm text-muted-foreground pl-[52px]">
          Receive emails about new products, features, and more.
        </p>
      </div>
      <div className="space-y-2">
        <Switch>Security alerts</Switch>
        <p className="text-sm text-muted-foreground pl-[52px]">
          Get notified about suspicious activity on your account.
        </p>
      </div>
    </div>
  ),
};

/**
 * Grouped switches
 */
export const GroupedSwitches: Story = {
  render: () => (
    <div className="w-[400px] space-y-6 rounded-lg border p-6">
      <div>
        <h3 className="mb-4 text-sm font-semibold">Communication</h3>
        <div className="space-y-4">
          <Switch defaultSelected>Email</Switch>
          <Switch defaultSelected>SMS</Switch>
          <Switch>Push notifications</Switch>
        </div>
      </div>
      <div className="border-t pt-6">
        <h3 className="mb-4 text-sm font-semibold">Privacy</h3>
        <div className="space-y-4">
          <Switch defaultSelected>Public profile</Switch>
          <Switch>Show email</Switch>
          <Switch>Allow messages from anyone</Switch>
        </div>
      </div>
    </div>
  ),
};

/**
 * Conditional content based on switch
 */
export const ConditionalContent: Story = {
  render: () => {
    const [isAdvanced, setIsAdvanced] = React.useState(false);

    return (
      <div className="w-[400px] space-y-4 rounded-lg border p-6">
        <Switch
          isSelected={isAdvanced}
          onChange={setIsAdvanced}
        >
          Advanced mode
        </Switch>
        {isAdvanced && (
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium">Advanced settings</p>
            <p className="text-sm text-muted-foreground mt-2">
              You now have access to advanced configuration options.
            </p>
          </div>
        )}
      </div>
    );
  },
};
