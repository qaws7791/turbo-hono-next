import { Button } from "@repo/ui/button";
import { Toast, toast } from "@repo/ui/toast";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Toast component based on React Aria Components
 *
 * Features:
 * - ARIA live regions for accessibility
 * - Multiple toast variants (success, error, warning, info)
 * - Auto-dismiss with customizable timeout
 * - Action buttons support
 * - Queue management
 * - Pause/resume on hover
 * - Accessible by default
 *
 * Toast Types:
 * - toast.success() - Success messages
 * - toast.error() - Error messages
 * - toast.warning() - Warning messages
 * - toast.info() - Info messages
 * - toast.default() - Default messages
 *
 * Common use cases:
 * - Success confirmations
 * - Error notifications
 * - Warning alerts
 * - Info messages
 * - Action feedback
 *
 * @see https://react-spectrum.adobe.com/react-aria/useToast.html
 */
const meta = {
  title: "Components/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Toast container setup
 * Add <Toast /> to your app root to enable toasts
 */
export const Setup: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add the Toast component to your app root:
      </p>
      <pre className="rounded-md bg-muted p-4 text-sm">
        <code>{`import { Toast } from "@repo/ui/toast";

function App() {
  return (
    <>
      {/* Your app content */}
      <Toast />
    </>
  );
}`}</code>
      </pre>
      <Toast />
    </div>
  ),
};

/**
 * Success toast
 */
export const Success: Story = {
  render: () => (
    <div className="space-y-4">
      <Button
        onPress={() =>
          toast.success({
            title: "Success!",
            description: "Your changes have been saved.",
          })
        }
      >
        Show Success Toast
      </Button>
      <Toast />
    </div>
  ),
};

/**
 * Error toast
 */
export const Error: Story = {
  render: () => (
    <div className="space-y-4">
      <Button
        variant="destructive"
        onPress={() =>
          toast.error({
            title: "Error",
            description: "Something went wrong. Please try again.",
          })
        }
      >
        Show Error Toast
      </Button>
      <Toast />
    </div>
  ),
};

/**
 * Warning toast
 */
export const Warning: Story = {
  render: () => (
    <div className="space-y-4">
      <Button
        onPress={() =>
          toast.warning({
            title: "Warning",
            description: "Your session will expire in 5 minutes.",
          })
        }
      >
        Show Warning Toast
      </Button>
      <Toast />
    </div>
  ),
};

/**
 * Info toast
 */
export const Info: Story = {
  render: () => (
    <div className="space-y-4">
      <Button
        onPress={() =>
          toast.info({
            title: "Info",
            description: "A new version is available.",
          })
        }
      >
        Show Info Toast
      </Button>
      <Toast />
    </div>
  ),
};

/**
 * Default toast
 */
export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <Button
        variant="outline"
        onPress={() =>
          toast.default({
            title: "Notification",
            description: "This is a default toast message.",
          })
        }
      >
        Show Default Toast
      </Button>
      <Toast />
    </div>
  ),
};

/**
 * Toast with action button
 */
export const WithAction: Story = {
  render: () => (
    <div className="space-y-4">
      <Button
        onPress={() =>
          toast.success({
            title: "File uploaded",
            description: "Your file has been uploaded successfully.",
            action: {
              label: "View",
              onClick: () => alert("Viewing file..."),
            },
          })
        }
      >
        Show Toast with Action
      </Button>
      <Toast />
    </div>
  ),
};

/**
 * Title only toast
 */
export const TitleOnly: Story = {
  render: () => (
    <div className="space-y-4">
      <Button
        onPress={() =>
          toast.success({
            title: "Saved successfully",
          })
        }
      >
        Show Title Only
      </Button>
      <Toast />
    </div>
  ),
};

/**
 * Description only toast
 */
export const DescriptionOnly: Story = {
  render: () => (
    <div className="space-y-4">
      <Button
        onPress={() =>
          toast.info({
            description: "This toast has only a description.",
          })
        }
      >
        Show Description Only
      </Button>
      <Toast />
    </div>
  ),
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onPress={() =>
            toast.success({
              title: "Success",
              description: "Operation completed successfully.",
            })
          }
        >
          Success
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onPress={() =>
            toast.error({
              title: "Error",
              description: "An error occurred.",
            })
          }
        >
          Error
        </Button>
        <Button
          size="sm"
          onPress={() =>
            toast.warning({
              title: "Warning",
              description: "Please review your changes.",
            })
          }
        >
          Warning
        </Button>
        <Button
          size="sm"
          onPress={() =>
            toast.info({
              title: "Info",
              description: "New updates available.",
            })
          }
        >
          Info
        </Button>
        <Button
          size="sm"
          variant="outline"
          onPress={() =>
            toast.default({
              title: "Default",
              description: "This is a notification.",
            })
          }
        >
          Default
        </Button>
      </div>
      <Toast />
    </div>
  ),
};

/**
 * Multiple toasts
 */
export const MultipleToasts: Story = {
  render: () => (
    <div className="space-y-4">
      <Button
        onPress={() => {
          toast.info({
            title: "First toast",
            description: "This is the first message.",
          });
          setTimeout(() => {
            toast.success({
              title: "Second toast",
              description: "This is the second message.",
            });
          }, 500);
          setTimeout(() => {
            toast.warning({
              title: "Third toast",
              description: "This is the third message.",
            });
          }, 1000);
        }}
      >
        Show Multiple Toasts
      </Button>
      <Toast />
    </div>
  ),
};

/**
 * Real-world examples
 */
export const RealWorldExamples: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <h3 className="text-lg font-semibold">Common Use Cases</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onPress={() =>
            toast.success({
              title: "Saved",
              description: "Your changes have been saved.",
            })
          }
        >
          Save Action
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={() =>
            toast.success({
              title: "Deleted",
              description: "Item has been deleted.",
              action: {
                label: "Undo",
                onClick: () => alert("Undoing..."),
              },
            })
          }
        >
          Delete with Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={() =>
            toast.error({
              title: "Upload Failed",
              description: "File size exceeds 10MB limit.",
            })
          }
        >
          Upload Error
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={() =>
            toast.warning({
              title: "Session Expiring",
              description: "Your session will expire in 5 minutes.",
              action: {
                label: "Extend",
                onClick: () => alert("Extending session..."),
              },
            })
          }
        >
          Session Warning
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={() =>
            toast.info({
              title: "Update Available",
              description: "A new version is ready to install.",
              action: {
                label: "Update",
                onClick: () => alert("Updating..."),
              },
            })
          }
        >
          Update Notice
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={() =>
            toast.success({
              title: "Copied!",
              description: "Text copied to clipboard.",
            })
          }
        >
          Copy Success
        </Button>
      </div>
      <Toast />
    </div>
  ),
};

/**
 * Form submission feedback
 */
export const FormFeedback: Story = {
  render: () => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      toast.success({
        title: "Form submitted",
        description: "Your information has been saved successfully.",
      });
    };

    return (
      <div className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="w-[350px] space-y-4 rounded-lg border p-6"
        >
          <h3 className="text-lg font-semibold">Contact Form</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
          >
            Submit
          </Button>
        </form>
        <Toast />
      </div>
    );
  },
};

/**
 * Loading and completion flow
 */
export const LoadingFlow: Story = {
  render: () => {
    const handleProcess = () => {
      toast.info({
        title: "Processing...",
        description: "Please wait while we process your request.",
      });

      setTimeout(() => {
        toast.success({
          title: "Complete!",
          description: "Your request has been processed successfully.",
        });
      }, 2000);
    };

    return (
      <div className="space-y-4">
        <Button onPress={handleProcess}>Start Process</Button>
        <Toast />
      </div>
    );
  },
};
