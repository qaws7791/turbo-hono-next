import { Button } from "@repo/ui/button";
import {
  ListBox,
  ListBoxHeader,
  ListBoxItem,
  ListBoxSection,
} from "@repo/ui/list-box";
import { Popover, PopoverTrigger } from "@repo/ui/popover";
import * as React from "react";
import { useListData } from "react-stately";

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Selection } from "react-aria-components";

/**
 * ListBox component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation (Arrow keys, Home/End, type to search)
 * - ARIA attributes for accessibility
 * - Single and multiple selection
 * - Sections with headers
 * - Disabled items
 * - Empty state handling
 * - Accessible by default
 *
 * Common use cases:
 * - Custom select dropdowns
 * - Option lists
 * - Menu items
 * - File lists
 * - Tag selection
 *
 * @see https://react-spectrum.adobe.com/react-aria/ListBox.html
 */
const meta = {
  title: "Components/ListBox",
  component: ListBox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ListBox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default single selection list
 */
export const Default: Story = {
  render: () => (
    <ListBox
      className="w-[250px]"
      aria-label="Options"
    >
      <ListBoxItem id="option1">Option 1</ListBoxItem>
      <ListBoxItem id="option2">Option 2</ListBoxItem>
      <ListBoxItem id="option3">Option 3</ListBoxItem>
    </ListBox>
  ),
};

/**
 * With default selected item
 */
export const WithDefaultSelection: Story = {
  render: () => (
    <ListBox
      className="w-[250px]"
      aria-label="Options"
      defaultSelectedKeys={["option2"]}
    >
      <ListBoxItem id="option1">Option 1</ListBoxItem>
      <ListBoxItem id="option2">Option 2 (Selected)</ListBoxItem>
      <ListBoxItem id="option3">Option 3</ListBoxItem>
    </ListBox>
  ),
};

/**
 * Multiple selection mode
 */
export const MultipleSelection: Story = {
  render: () => (
    <ListBox
      className="w-[250px]"
      aria-label="Options"
      selectionMode="multiple"
      defaultSelectedKeys={["option1", "option3"]}
    >
      <ListBoxItem id="option1">Option 1</ListBoxItem>
      <ListBoxItem id="option2">Option 2</ListBoxItem>
      <ListBoxItem id="option3">Option 3</ListBoxItem>
      <ListBoxItem id="option4">Option 4</ListBoxItem>
    </ListBox>
  ),
};

/**
 * With disabled items
 */
export const WithDisabled: Story = {
  render: () => (
    <ListBox
      className="w-[250px]"
      aria-label="Options"
    >
      <ListBoxItem id="option1">Option 1</ListBoxItem>
      <ListBoxItem
        id="option2"
        isDisabled
      >
        Option 2 (Disabled)
      </ListBoxItem>
      <ListBoxItem id="option3">Option 3</ListBoxItem>
    </ListBox>
  ),
};

/**
 * Grouped with sections
 */
export const WithSections: Story = {
  render: () => (
    <ListBox
      className="w-[250px]"
      aria-label="Fruits"
    >
      <ListBoxSection>
        <ListBoxHeader>Citrus</ListBoxHeader>
        <ListBoxItem id="orange">Orange</ListBoxItem>
        <ListBoxItem id="lemon">Lemon</ListBoxItem>
        <ListBoxItem id="lime">Lime</ListBoxItem>
      </ListBoxSection>
      <ListBoxSection>
        <ListBoxHeader>Berries</ListBoxHeader>
        <ListBoxItem id="strawberry">Strawberry</ListBoxItem>
        <ListBoxItem id="blueberry">Blueberry</ListBoxItem>
        <ListBoxItem id="raspberry">Raspberry</ListBoxItem>
      </ListBoxSection>
    </ListBox>
  ),
};

/**
 * Controlled selection
 */
export const Controlled: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<Selection>(
      new Set(["option1"]),
    );

    return (
      <div className="space-y-4">
        <ListBox
          className="w-[250px]"
          aria-label="Options"
          selectionMode="single"
          selectedKeys={selected}
          onSelectionChange={setSelected}
        >
          <ListBoxItem id="option1">Option 1</ListBoxItem>
          <ListBoxItem id="option2">Option 2</ListBoxItem>
          <ListBoxItem id="option3">Option 3</ListBoxItem>
          <ListBoxItem id="option4">Option 4</ListBoxItem>
        </ListBox>
        <div className="w-[250px] rounded-md bg-muted p-4">
          <p className="text-sm font-medium">Selected: {selected}</p>
        </div>
      </div>
    );
  },
};

/**
 * In popover (custom select)
 */
export const InPopover: Story = {
  render: () => {
    const [selected, setSelected] = React.useState("Option 1");

    return (
      <PopoverTrigger>
        <Button
          variant="outline"
          className="w-[200px] justify-between"
        >
          {selected}
          <span>▼</span>
        </Button>
        <Popover className="w-[--trigger-width]">
          <ListBox
            aria-label="Options"
            selectionMode="single"
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0];
              setSelected(`Option ${key}`);
            }}
          >
            <ListBoxItem id="1">Option 1</ListBoxItem>
            <ListBoxItem id="2">Option 2</ListBoxItem>
            <ListBoxItem id="3">Option 3</ListBoxItem>
            <ListBoxItem id="4">Option 4</ListBoxItem>
          </ListBox>
        </Popover>
      </PopoverTrigger>
    );
  },
};

/**
 * With icons or custom content
 */
export const WithIcons: Story = {
  render: () => (
    <ListBox
      className="w-[250px]"
      aria-label="Actions"
    >
      <ListBoxItem id="edit">
        <div className="flex items-center gap-2">
          <span>✏</span>
          <span>Edit</span>
        </div>
      </ListBoxItem>
      <ListBoxItem id="copy">
        <div className="flex items-center gap-2">
          <span>📋</span>
          <span>Copy</span>
        </div>
      </ListBoxItem>
      <ListBoxItem id="delete">
        <div className="flex items-center gap-2">
          <span>🗑</span>
          <span>Delete</span>
        </div>
      </ListBoxItem>
    </ListBox>
  ),
};

/**
 * File browser example
 */
export const FileBrowser: Story = {
  render: () => {
    const list = useListData({
      initialItems: [
        { id: "doc1", name: "Report.pdf" },
        { id: "doc2", name: "Presentation.pptx" },
        { id: "img1", name: "Photo1.jpg" },
        { id: "img2", name: "Photo2.png" },
      ],
    });

    return (
      <div className="space-y-4">
        <ListBox
          className="w-[350px]"
          aria-label="Files"
          selectionMode="multiple"
          selectedKeys={list.selectedKeys}
          onSelectionChange={list.setSelectedKeys}
        >
          <ListBoxSection>
            <ListBoxHeader>Documents</ListBoxHeader>
            <ListBoxItem id="doc1">
              <div className="flex items-center gap-2">
                <span>📄</span>
                <span>Report.pdf</span>
              </div>
            </ListBoxItem>
            <ListBoxItem id="doc2">
              <div className="flex items-center gap-2">
                <span>📄</span>
                <span>Presentation.pptx</span>
              </div>
            </ListBoxItem>
          </ListBoxSection>
          <ListBoxSection>
            <ListBoxHeader>Images</ListBoxHeader>
            <ListBoxItem id="img1">
              <div className="flex items-center gap-2">
                <span>🖼</span>
                <span>Photo1.jpg</span>
              </div>
            </ListBoxItem>
            <ListBoxItem id="img2">
              <div className="flex items-center gap-2">
                <span>🖼</span>
                <span>Photo2.png</span>
              </div>
            </ListBoxItem>
          </ListBoxSection>
        </ListBox>
        <div className="w-[350px] rounded-md bg-muted p-4">
          <p className="text-sm font-medium">
            Selected:{" "}
            {list.selectedKeys === "all" ? "All" : list.selectedKeys.size}{" "}
            file(s)
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Status list with indicators
 */
export const StatusList: Story = {
  render: () => (
    <ListBox
      className="w-[300px]"
      aria-label="Status"
    >
      <ListBoxItem id="active">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>Active</span>
        </div>
      </ListBoxItem>
      <ListBoxItem id="pending">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <span>Pending</span>
        </div>
      </ListBoxItem>
      <ListBoxItem id="inactive">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gray-500" />
          <span>Inactive</span>
        </div>
      </ListBoxItem>
    </ListBox>
  ),
};

/**
 * Empty state
 */
export const Empty: Story = {
  render: () => (
    <ListBox
      className="w-[250px]"
      aria-label="Empty list"
      renderEmptyState={() => "No items"}
    >
      {[]}
    </ListBox>
  ),
};

/**
 * Long list with many items
 */
export const LongList: Story = {
  render: () => (
    <ListBox
      className="w-[250px] max-h-[300px]"
      aria-label="Long list"
    >
      {Array.from({ length: 50 }, (_, i) => (
        <ListBoxItem
          key={i}
          id={`item-${i}`}
        >
          Item {i + 1}
        </ListBoxItem>
      ))}
    </ListBox>
  ),
};
