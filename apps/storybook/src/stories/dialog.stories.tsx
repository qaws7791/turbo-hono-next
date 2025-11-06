import * as React from "react";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";

import type { Meta, StoryObj } from "@storybook/react";

/**
 * Dialog component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation (ESC to close, Tab to navigate)
 * - ARIA attributes for accessibility
 * - Focus management and trap
 * - Modal and Sheet (drawer) variants
 * - Backdrop overlay
 * - Close button built-in
 * - Accessible by default
 *
 * Common use cases:
 * - Confirmation dialogs
 * - Forms in overlays
 * - Content details
 * - User settings
 * - Alerts and warnings
 *
 * @see https://react-spectrum.adobe.com/react-aria/Dialog.html
 */
const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default centered modal dialog
 */
export const Default: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Open Dialog</Button>
      <DialogOverlay>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>
              This is a dialog description explaining what this dialog is for.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">Dialog content goes here.</p>
          </div>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  ),
};

/**
 * Confirmation dialog
 */
export const Confirmation: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="destructive">Delete Item</Button>
      <DialogOverlay>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              item.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  ),
};

/**
 * Form dialog
 */
export const FormDialog: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Add User</Button>
      <DialogOverlay>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Enter the user details below.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                placeholder="Enter name"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="Enter email"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>User</option>
                <option>Admin</option>
                <option>Editor</option>
              </select>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button type="submit">Create User</Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  ),
};

/**
 * Alert dialog without close button
 */
export const Alert: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Show Alert</Button>
      <DialogOverlay isDismissable={false}>
        <DialogContent
          closeButton={false}
          role="alertdialog"
        >
          <DialogHeader>
            <DialogTitle>Session Expired</DialogTitle>
            <DialogDescription>
              Your session has expired. Please log in again to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button>Log In</Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  ),
};

/**
 * Sheet from right (drawer)
 */
export const SheetRight: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Open Drawer</Button>
      <DialogOverlay>
        <DialogContent side="right">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Adjust your preferences here.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>English</option>
                <option>Español</option>
                <option>Français</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  ),
};

/**
 * Sheet from left
 */
export const SheetLeft: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Open Menu</Button>
      <DialogOverlay>
        <DialogContent side="left">
          <DialogHeader>
            <DialogTitle>Navigation</DialogTitle>
          </DialogHeader>
          <nav className="flex-1 space-y-2 py-4">
            <a
              href="#"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              Home
            </a>
            <a
              href="#"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              Products
            </a>
            <a
              href="#"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              About
            </a>
            <a
              href="#"
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              Contact
            </a>
          </nav>
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  ),
};

/**
 * Sheet from bottom
 */
export const SheetBottom: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Open Bottom Sheet</Button>
      <DialogOverlay>
        <DialogContent
          side="bottom"
          className="h-[300px]"
        >
          <DialogHeader>
            <DialogTitle>Share</DialogTitle>
            <DialogDescription>
              Share this content with others
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 py-4">
            <button className="flex flex-col items-center gap-2 rounded-md p-4 hover:bg-muted">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                📧
              </div>
              <span className="text-xs">Email</span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-md p-4 hover:bg-muted">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-400 text-white">
                🐦
              </div>
              <span className="text-xs">Twitter</span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-md p-4 hover:bg-muted">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                👥
              </div>
              <span className="text-xs">Facebook</span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-md p-4 hover:bg-muted">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-600 text-white">
                📋
              </div>
              <span className="text-xs">Copy</span>
            </button>
          </div>
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  ),
};

/**
 * Large content dialog with scrolling
 */
export const LargeContent: Story = {
  render: () => (
    <DialogTrigger>
      <Button>View Terms</Button>
      <DialogOverlay>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription>
              Please read our terms and conditions carefully.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] space-y-4 overflow-y-auto py-4 text-sm">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur.
            </p>
            <p>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum.
            </p>
            {Array.from({ length: 10 }).map((_, i) => (
              <p key={i}>
                Section {i + 1}: Additional terms and conditions content goes
                here. This is a longer paragraph to demonstrate scrolling
                behavior in the dialog.
              </p>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline">Decline</Button>
            <Button>Accept</Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  ),
};

/**
 * Nested dialogs
 */
export const Nested: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Open First Dialog</Button>
      <DialogOverlay>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>First Dialog</DialogTitle>
            <DialogDescription>
              You can open another dialog from here.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <DialogTrigger>
              <Button>Open Second Dialog</Button>
              <DialogOverlay>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Second Dialog</DialogTitle>
                    <DialogDescription>
                      This is a nested dialog.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm">Nested dialog content.</p>
                  </div>
                  <DialogFooter>
                    <Button>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </DialogOverlay>
            </DialogTrigger>
          </div>
          <DialogFooter>
            <Button variant="outline">Close</Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  ),
};
