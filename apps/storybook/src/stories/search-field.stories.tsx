import {
  FormSearchField,
  SearchField,
  SearchFieldClear,
  SearchFieldGroup,
  SearchFieldInput,
} from "@repo/ui/search-field";
import { SearchIcon, XIcon } from "lucide-react";
import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * SearchField component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation (ESC to clear)
 * - ARIA attributes for accessibility
 * - Built-in search icon and clear button
 * - Automatically shows/hides clear button
 * - Submit on Enter key
 * - Validation support
 * - Accessible by default
 *
 * Common use cases:
 * - Site-wide search
 * - Table/list filtering
 * - Product search
 * - User search
 * - Document search
 *
 * @see https://react-spectrum.adobe.com/react-aria/SearchField.html
 */
const meta = {
  title: "Components/SearchField",
  component: SearchField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isDisabled: {
      control: "boolean",
      description: "Whether the search field is disabled",
    },
  },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default search field
 */
export const Default: Story = {
  render: () => (
    <SearchField className="w-[300px]">
      <SearchFieldGroup>
        <SearchIcon
          aria-hidden
          className="size-4 text-muted-foreground"
        />
        <SearchFieldInput placeholder="Search..." />
        <SearchFieldClear>
          <XIcon
            aria-hidden
            className="size-4"
          />
        </SearchFieldClear>
      </SearchFieldGroup>
    </SearchField>
  ),
};

/**
 * With label
 */
export const WithLabel: Story = {
  render: () => (
    <FormSearchField
      label="Search"
      placeholder="Search..."
      className="w-[300px]"
    />
  ),
};

/**
 * With description
 */
export const WithDescription: Story = {
  render: () => (
    <FormSearchField
      label="Search Products"
      description="Search by name, category, or SKU"
      placeholder="Search..."
      className="w-[300px]"
    />
  ),
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  render: () => (
    <FormSearchField
      label="Search"
      placeholder="Search..."
      isDisabled
      className="w-[300px]"
    />
  ),
};

/**
 * With default value
 */
export const WithDefaultValue: Story = {
  render: () => (
    <FormSearchField
      label="Search"
      defaultValue="React components"
      className="w-[300px]"
    />
  ),
};

/**
 * Controlled search field
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState("");

    return (
      <div className="space-y-4">
        <FormSearchField
          label="Search"
          value={value}
          onChange={setValue}
          className="w-[300px]"
        />
        <div className="w-[300px] rounded-md bg-muted p-4">
          <p className="text-sm font-medium">
            Search query: {value || "(empty)"}
          </p>
        </div>
      </div>
    );
  },
};

/**
 * With submit handler
 */
export const WithSubmit: Story = {
  render: () => {
    const [query, setQuery] = React.useState("");
    const [submitted, setSubmitted] = React.useState("");

    return (
      <div className="space-y-4">
        <FormSearchField
          label="Search"
          value={query}
          onChange={setQuery}
          onSubmit={(value) => setSubmitted(value)}
          className="w-[300px]"
        />
        <div className="w-[300px] rounded-md bg-muted p-4">
          <p className="text-sm font-medium">
            Last search: {submitted || "None"}
          </p>
          <p className="text-xs text-muted-foreground">Press Enter to submit</p>
        </div>
      </div>
    );
  },
};

/**
 * Site-wide search header
 */
export const SiteSearch: Story = {
  render: () => (
    <div className="w-[600px] rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Logo</h1>
        <SearchField className="w-[400px]">
          <SearchFieldGroup>
            <SearchIcon
              aria-hidden
              className="size-4 text-muted-foreground"
            />
            <SearchFieldInput placeholder="Search products, categories..." />
            <SearchFieldClear>
              <XIcon
                aria-hidden
                className="size-4"
              />
            </SearchFieldClear>
          </SearchFieldGroup>
        </SearchField>
        <div className="flex gap-2">
          <button className="h-10 rounded-md px-4 text-sm">Cart</button>
          <button className="h-10 rounded-md bg-primary px-4 text-sm text-primary-foreground">
            Sign In
          </button>
        </div>
      </div>
    </div>
  ),
};

/**
 * Table filter
 */
export const TableFilter: Story = {
  render: () => {
    const [searchQuery, setSearchQuery] = React.useState("");

    const users = [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
      { id: 3, name: "Bob Johnson", email: "bob@example.com" },
      { id: 4, name: "Alice Williams", email: "alice@example.com" },
    ];

    const filteredUsers = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
      <div className="w-[500px] space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Users</h2>
          <SearchField
            className="w-[250px]"
            value={searchQuery}
            onChange={setSearchQuery}
          >
            <SearchFieldGroup>
              <SearchIcon
                aria-hidden
                className="size-4 text-muted-foreground"
              />
              <SearchFieldInput placeholder="Search users..." />
              <SearchFieldClear>
                <XIcon
                  aria-hidden
                  className="size-4"
                />
              </SearchFieldClear>
            </SearchFieldGroup>
          </SearchField>
        </div>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left text-sm font-medium">Name</th>
                <th className="p-3 text-left text-sm font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-0"
                >
                  <td className="p-3 text-sm">{user.name}</td>
                  <td className="p-3 text-sm">{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>
    );
  },
};

/**
 * Product search with results
 */
export const ProductSearch: Story = {
  render: () => {
    const [query, setQuery] = React.useState("");

    const products = [
      "Laptop Computer",
      "Wireless Mouse",
      "USB Keyboard",
      "Monitor Stand",
      "Webcam HD",
      "Headphones",
    ];

    const results = query
      ? products.filter((p) => p.toLowerCase().includes(query.toLowerCase()))
      : [];

    return (
      <div className="w-[400px] space-y-2">
        <FormSearchField
          label="Search Products"
          value={query}
          onChange={setQuery}
          className="w-full"
        />
        {query && (
          <div className="rounded-lg border">
            {results.length > 0 ? (
              <div className="p-2">
                {results.map((product, index) => (
                  <div
                    key={index}
                    className="cursor-pointer rounded-md p-2 text-sm hover:bg-muted"
                  >
                    {product}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No products found
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
};

/**
 * Search with filters
 */
export const SearchWithFilters: Story = {
  render: () => (
    <div className="w-[500px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Advanced Search</h2>
      <FormSearchField
        label="Search Query"
        placeholder="Enter keywords..."
        className="w-full"
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Clothing</option>
            <option>Books</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Sort By</label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>Relevance</option>
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
      </div>
      <button className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Search
      </button>
    </div>
  ),
};

/**
 * Command palette style
 */
export const CommandPalette: Story = {
  render: () => {
    const [query, setQuery] = React.useState("");

    const commands = [
      { name: "New File", shortcut: "Ctrl+N" },
      { name: "Open File", shortcut: "Ctrl+O" },
      { name: "Save", shortcut: "Ctrl+S" },
      { name: "Find", shortcut: "Ctrl+F" },
      { name: "Replace", shortcut: "Ctrl+H" },
    ];

    const filtered = commands.filter((cmd) =>
      cmd.name.toLowerCase().includes(query.toLowerCase()),
    );

    return (
      <div className="w-[500px] rounded-lg border shadow-lg">
        <div className="border-b p-4">
          <SearchField
            value={query}
            onChange={setQuery}
          >
            <SearchFieldGroup>
              <SearchIcon
                aria-hidden
                className="size-4 text-muted-foreground"
              />
              <SearchFieldInput placeholder="Type a command or search..." />
              <SearchFieldClear>
                <XIcon
                  aria-hidden
                  className="size-4"
                />
              </SearchFieldClear>
            </SearchFieldGroup>
          </SearchField>
        </div>
        <div className="max-h-[300px] overflow-auto">
          {filtered.map((cmd, index) => (
            <div
              key={index}
              className="flex cursor-pointer items-center justify-between border-b p-3 hover:bg-muted"
            >
              <span className="text-sm">{cmd.name}</span>
              <kbd className="rounded border px-2 py-1 text-xs">
                {cmd.shortcut}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Search with loading state
 */
export const WithLoading: Story = {
  render: () => {
    const [query, setQuery] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
      if (query) {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
      }
    }, [query]);

    return (
      <div className="space-y-4">
        <FormSearchField
          label="Search"
          value={query}
          onChange={setQuery}
          className="w-[300px]"
        />
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Searching...
          </div>
        )}
      </div>
    );
  },
};
