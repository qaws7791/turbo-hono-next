import * as React from "react";
import { FormProgressBar, Progress } from "@repo/ui/progress-bar";

import type { Meta, StoryObj } from "@storybook/react";

/**
 * ProgressBar component based on React Aria Components
 *
 * Features:
 * - ARIA attributes for accessibility
 * - Smooth progress animation
 * - Shows percentage value
 * - Customizable appearance
 * - Supports indeterminate state
 *
 * Common use cases:
 * - File upload progress
 * - Form completion progress
 * - Download progress
 * - Task completion indicators
 * - Skill level displays
 *
 * @see https://react-spectrum.adobe.com/react-aria/ProgressBar.html
 */
const meta = {
  title: "Components/ProgressBar",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Current progress value (0-100)",
    },
    minValue: {
      control: "number",
      description: "Minimum value",
      table: {
        defaultValue: { summary: 0 },
      },
    },
    maxValue: {
      control: "number",
      description: "Maximum value",
      table: {
        defaultValue: { summary: 100 },
      },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default progress bar at 50%
 */
export const Default: Story = {
  args: {
    value: 50,
    className: "w-[300px]",
  },
};

/**
 * Progress at 0%
 */
export const Empty: Story = {
  args: {
    value: 0,
    className: "w-[300px]",
  },
};

/**
 * Progress at 100% (complete)
 */
export const Complete: Story = {
  args: {
    value: 100,
    className: "w-[300px]",
  },
};

/**
 * Form progress bar with label
 */
export const WithLabel: Story = {
  render: () => (
    <FormProgressBar
      label="Progress"
      value={65}
      className="w-[300px]"
    />
  ),
};

/**
 * Form progress bar without value display
 */
export const WithoutValue: Story = {
  render: () => (
    <FormProgressBar
      label="Loading"
      value={45}
      showValue={false}
      className="w-[300px]"
    />
  ),
};

/**
 * Different progress values
 */
export const DifferentValues: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <FormProgressBar
        label="25%"
        value={25}
        className="w-[300px]"
      />
      <FormProgressBar
        label="50%"
        value={50}
        className="w-[300px]"
      />
      <FormProgressBar
        label="75%"
        value={75}
        className="w-[300px]"
      />
      <FormProgressBar
        label="100%"
        value={100}
        className="w-[300px]"
      />
    </div>
  ),
};

/**
 * Animated progress simulation
 */
export const Animated: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(timer);
    }, []);

    return (
      <FormProgressBar
        label="Loading"
        value={progress}
        className="w-[300px]"
      />
    );
  },
};

/**
 * File upload progress example
 */
export const FileUpload: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0);
    const [isUploading, setIsUploading] = React.useState(false);

    const startUpload = () => {
      setIsUploading(true);
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsUploading(false);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
    };

    return (
      <div className="w-[400px] space-y-4 rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Upload File</h3>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">document.pdf</p>
          <FormProgressBar
            label="Uploading"
            value={progress}
            className="w-full"
          />
        </div>
        <button
          onClick={startUpload}
          disabled={isUploading}
          className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Start Upload"}
        </button>
      </div>
    );
  },
};

/**
 * Multi-step form progress
 */
export const MultiStepForm: Story = {
  render: () => {
    const [step, setStep] = React.useState(1);
    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    return (
      <div className="w-[400px] space-y-4 rounded-lg border p-6">
        <div>
          <h3 className="text-lg font-semibold">Account Setup</h3>
          <p className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
        </div>
        <FormProgressBar
          label="Progress"
          value={progress}
          className="w-full"
        />
        <div className="space-y-2 rounded-md bg-muted p-4">
          <p className="text-sm font-medium">Step {step} Content</p>
          <p className="text-sm text-muted-foreground">
            Complete this step to continue...
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="h-10 flex-1 rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setStep(Math.min(totalSteps, step + 1))}
            disabled={step === totalSteps}
            className="h-10 flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {step === totalSteps ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    );
  },
};

/**
 * Skills or ratings display
 */
export const SkillsDisplay: Story = {
  render: () => (
    <div className="w-[350px] space-y-4 rounded-lg border p-6">
      <h3 className="text-lg font-semibold">Skills</h3>
      <div className="space-y-4">
        <FormProgressBar
          label="JavaScript"
          value={90}
        />
        <FormProgressBar
          label="React"
          value={85}
        />
        <FormProgressBar
          label="TypeScript"
          value={75}
        />
        <FormProgressBar
          label="Node.js"
          value={70}
        />
        <FormProgressBar
          label="Python"
          value={60}
        />
      </div>
    </div>
  ),
};

/**
 * Dashboard metrics
 */
export const DashboardMetrics: Story = {
  render: () => (
    <div className="w-[400px] space-y-6 rounded-lg border p-6">
      <h3 className="text-lg font-semibold">Monthly Goals</h3>
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Sales Target</span>
            <span className="text-sm text-muted-foreground">
              $75,000 / $100,000
            </span>
          </div>
          <Progress
            value={75}
            className="w-full"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">New Customers</span>
            <span className="text-sm text-muted-foreground">120 / 150</span>
          </div>
          <Progress
            value={80}
            className="w-full"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Support Tickets</span>
            <span className="text-sm text-muted-foreground">45 / 50</span>
          </div>
          <Progress
            value={90}
            className="w-full"
          />
        </div>
      </div>
    </div>
  ),
};

/**
 * Custom colors
 */
export const CustomColors: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="w-[300px]">
        <p className="mb-2 text-sm font-medium">Success</p>
        <Progress
          value={80}
          fillClassName="bg-green-500"
          className="w-full"
        />
      </div>
      <div className="w-[300px]">
        <p className="mb-2 text-sm font-medium">Warning</p>
        <Progress
          value={60}
          fillClassName="bg-yellow-500"
          className="w-full"
        />
      </div>
      <div className="w-[300px]">
        <p className="mb-2 text-sm font-medium">Error</p>
        <Progress
          value={40}
          fillClassName="bg-red-500"
          className="w-full"
        />
      </div>
    </div>
  ),
};

/**
 * Different sizes
 */
export const DifferentSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="w-[300px]">
        <p className="mb-2 text-sm font-medium">Small</p>
        <Progress
          value={65}
          barClassName="h-2"
          className="w-full"
        />
      </div>
      <div className="w-[300px]">
        <p className="mb-2 text-sm font-medium">Default</p>
        <Progress
          value={65}
          className="w-full"
        />
      </div>
      <div className="w-[300px]">
        <p className="mb-2 text-sm font-medium">Large</p>
        <Progress
          value={65}
          barClassName="h-6"
          className="w-full"
        />
      </div>
    </div>
  ),
};
