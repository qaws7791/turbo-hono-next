import { Tab, TabList, TabPanel, Tabs } from "@repo/ui/tabs";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Tabs component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation (Arrow keys to navigate tabs, Tab to move focus)
 * - ARIA attributes for accessibility
 * - Horizontal and vertical orientations
 * - Animated selection indicator
 * - Lazy loading panel content support
 * - Accessible by default
 *
 * Components:
 * - Tabs: Container component
 * - TabList: Container for tab buttons
 * - Tab: Individual tab button
 * - TabPanel: Content panel for each tab
 *
 * Common use cases:
 * - Settings panels
 * - Multi-step forms
 * - Content organization
 * - Dashboard sections
 * - Product information
 *
 * @see https://react-spectrum.adobe.com/react-aria/Tabs.html
 */
const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default horizontal tabs
 */
export const Default: Story = {
  render: () => (
    <Tabs className="w-[400px]">
      <TabList>
        <Tab id="tab1">Tab 1</Tab>
        <Tab id="tab2">Tab 2</Tab>
        <Tab id="tab3">Tab 3</Tab>
      </TabList>
      <TabPanel
        id="tab1"
        className="mt-4 p-4"
      >
        <h3 className="mb-2 text-lg font-semibold">Tab 1 Content</h3>
        <p className="text-sm text-muted-foreground">
          This is the content for the first tab.
        </p>
      </TabPanel>
      <TabPanel
        id="tab2"
        className="mt-4 p-4"
      >
        <h3 className="mb-2 text-lg font-semibold">Tab 2 Content</h3>
        <p className="text-sm text-muted-foreground">
          This is the content for the second tab.
        </p>
      </TabPanel>
      <TabPanel
        id="tab3"
        className="mt-4 p-4"
      >
        <h3 className="mb-2 text-lg font-semibold">Tab 3 Content</h3>
        <p className="text-sm text-muted-foreground">
          This is the content for the third tab.
        </p>
      </TabPanel>
    </Tabs>
  ),
};

/**
 * With default selected tab
 */
export const DefaultSelected: Story = {
  render: () => (
    <Tabs
      defaultSelectedKey="profile"
      className="w-[400px]"
    >
      <TabList>
        <Tab id="account">Account</Tab>
        <Tab id="profile">Profile</Tab>
        <Tab id="settings">Settings</Tab>
      </TabList>
      <TabPanel
        id="account"
        className="mt-4 p-4"
      >
        Account settings content
      </TabPanel>
      <TabPanel
        id="profile"
        className="mt-4 p-4"
      >
        Profile information (default selected)
      </TabPanel>
      <TabPanel
        id="settings"
        className="mt-4 p-4"
      >
        Settings configuration
      </TabPanel>
    </Tabs>
  ),
};

/**
 * With disabled tab
 */
export const WithDisabledTab: Story = {
  render: () => (
    <Tabs className="w-[400px]">
      <TabList>
        <Tab id="tab1">Enabled</Tab>
        <Tab
          id="tab2"
          isDisabled
        >
          Disabled
        </Tab>
        <Tab id="tab3">Enabled</Tab>
      </TabList>
      <TabPanel
        id="tab1"
        className="mt-4 p-4"
      >
        Content for enabled tab 1
      </TabPanel>
      <TabPanel
        id="tab2"
        className="mt-4 p-4"
      >
        Content for disabled tab
      </TabPanel>
      <TabPanel
        id="tab3"
        className="mt-4 p-4"
      >
        Content for enabled tab 3
      </TabPanel>
    </Tabs>
  ),
};

/**
 * Settings panel example
 */
export const SettingsPanel: Story = {
  render: () => (
    <div className="w-[500px] rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-bold">Settings</h2>
      <Tabs>
        <TabList>
          <Tab id="general">General</Tab>
          <Tab id="privacy">Privacy</Tab>
          <Tab id="notifications">Notifications</Tab>
        </TabList>
        <TabPanel
          id="general"
          className="mt-4 space-y-4"
        >
          <div>
            <h3 className="mb-2 text-lg font-semibold">General Settings</h3>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">Username</label>
                <input
                  type="text"
                  defaultValue="johndoe"
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel
          id="privacy"
          className="mt-4 space-y-4"
        >
          <div>
            <h3 className="mb-2 text-lg font-semibold">Privacy Settings</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                />
                <span className="text-sm">Make profile public</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm">Allow search engines</span>
              </label>
            </div>
          </div>
        </TabPanel>
        <TabPanel
          id="notifications"
          className="mt-4 space-y-4"
        >
          <div>
            <h3 className="mb-2 text-lg font-semibold">
              Notification Preferences
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                />
                <span className="text-sm">Email notifications</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                />
                <span className="text-sm">Push notifications</span>
              </label>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  ),
};

/**
 * Product information tabs
 */
export const ProductInformation: Story = {
  render: () => (
    <div className="w-[500px] rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-bold">Product Details</h2>
      <Tabs>
        <TabList>
          <Tab id="description">Description</Tab>
          <Tab id="specs">Specifications</Tab>
          <Tab id="reviews">Reviews</Tab>
        </TabList>
        <TabPanel
          id="description"
          className="mt-4"
        >
          <h3 className="mb-2 text-lg font-semibold">Product Description</h3>
          <p className="text-sm text-muted-foreground">
            This is a high-quality product designed to meet your needs. It
            features durable construction, modern design, and excellent
            performance.
          </p>
        </TabPanel>
        <TabPanel
          id="specs"
          className="mt-4"
        >
          <h3 className="mb-2 text-lg font-semibold">Specifications</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="font-medium">Dimensions:</dt>
              <dd className="text-muted-foreground">10 x 8 x 2 inches</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Weight:</dt>
              <dd className="text-muted-foreground">1.5 lbs</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Material:</dt>
              <dd className="text-muted-foreground">Aluminum</dd>
            </div>
          </dl>
        </TabPanel>
        <TabPanel
          id="reviews"
          className="mt-4"
        >
          <h3 className="mb-2 text-lg font-semibold">Customer Reviews</h3>
          <div className="space-y-4">
            <div className="rounded-md border p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-medium">John D.</span>
                <span className="text-sm text-muted-foreground">
                  ⭐⭐⭐⭐⭐
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Great product!</p>
            </div>
            <div className="rounded-md border p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-medium">Sarah M.</span>
                <span className="text-sm text-muted-foreground">⭐⭐⭐⭐</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Very satisfied with my purchase.
              </p>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  ),
};

/**
 * Dashboard sections
 */
export const Dashboard: Story = {
  render: () => (
    <div className="w-[600px] rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-bold">Analytics Dashboard</h2>
      <Tabs>
        <TabList>
          <Tab id="overview">Overview</Tab>
          <Tab id="traffic">Traffic</Tab>
          <Tab id="revenue">Revenue</Tab>
          <Tab id="users">Users</Tab>
        </TabList>
        <TabPanel
          id="overview"
          className="mt-4"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="mt-1 text-2xl font-bold">12,345</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Conversions</p>
              <p className="mt-1 text-2xl font-bold">567</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="mt-1 text-2xl font-bold">$8,901</p>
            </div>
          </div>
        </TabPanel>
        <TabPanel
          id="traffic"
          className="mt-4"
        >
          <p className="text-sm text-muted-foreground">
            Traffic analytics will be displayed here.
          </p>
        </TabPanel>
        <TabPanel
          id="revenue"
          className="mt-4"
        >
          <p className="text-sm text-muted-foreground">
            Revenue statistics will be displayed here.
          </p>
        </TabPanel>
        <TabPanel
          id="users"
          className="mt-4"
        >
          <p className="text-sm text-muted-foreground">
            User analytics will be displayed here.
          </p>
        </TabPanel>
      </Tabs>
    </div>
  ),
};

/**
 * Tabs with icons
 */
export const WithIcons: Story = {
  render: () => (
    <Tabs className="w-[400px]">
      <TabList>
        <Tab id="home">
          <span className="flex items-center gap-2">🏠 Home</span>
        </Tab>
        <Tab id="profile">
          <span className="flex items-center gap-2">👤 Profile</span>
        </Tab>
        <Tab id="settings">
          <span className="flex items-center gap-2">⚙ Settings</span>
        </Tab>
      </TabList>
      <TabPanel
        id="home"
        className="mt-4 p-4"
      >
        Home content
      </TabPanel>
      <TabPanel
        id="profile"
        className="mt-4 p-4"
      >
        Profile content
      </TabPanel>
      <TabPanel
        id="settings"
        className="mt-4 p-4"
      >
        Settings content
      </TabPanel>
    </Tabs>
  ),
};

/**
 * Many tabs example
 */
export const ManyTabs: Story = {
  render: () => (
    <Tabs className="w-[600px]">
      <TabList>
        <Tab id="tab1">Tab 1</Tab>
        <Tab id="tab2">Tab 2</Tab>
        <Tab id="tab3">Tab 3</Tab>
        <Tab id="tab4">Tab 4</Tab>
        <Tab id="tab5">Tab 5</Tab>
        <Tab id="tab6">Tab 6</Tab>
      </TabList>
      <TabPanel
        id="tab1"
        className="mt-4 p-4"
      >
        Content 1
      </TabPanel>
      <TabPanel
        id="tab2"
        className="mt-4 p-4"
      >
        Content 2
      </TabPanel>
      <TabPanel
        id="tab3"
        className="mt-4 p-4"
      >
        Content 3
      </TabPanel>
      <TabPanel
        id="tab4"
        className="mt-4 p-4"
      >
        Content 4
      </TabPanel>
      <TabPanel
        id="tab5"
        className="mt-4 p-4"
      >
        Content 5
      </TabPanel>
      <TabPanel
        id="tab6"
        className="mt-4 p-4"
      >
        Content 6
      </TabPanel>
    </Tabs>
  ),
};

/**
 * Code editor style tabs
 */
export const CodeEditorStyle: Story = {
  render: () => (
    <div className="w-[600px] rounded-lg border">
      <Tabs>
        <TabList>
          <Tab id="index">index.tsx</Tab>
          <Tab id="styles">styles.css</Tab>
          <Tab id="config">config.json</Tab>
        </TabList>
        <TabPanel
          id="index"
          className="p-4"
        >
          <pre className="rounded-md bg-muted p-4 text-sm">
            <code>{`export default function App() {
  return <div>Hello World</div>
}`}</code>
          </pre>
        </TabPanel>
        <TabPanel
          id="styles"
          className="p-4"
        >
          <pre className="rounded-md bg-muted p-4 text-sm">
            <code>{`.container {
  max-width: 1200px;
  margin: 0 auto;
}`}</code>
          </pre>
        </TabPanel>
        <TabPanel
          id="config"
          className="p-4"
        >
          <pre className="rounded-md bg-muted p-4 text-sm">
            <code>{`{
  "name": "my-app",
  "version": "1.0.0"
}`}</code>
          </pre>
        </TabPanel>
      </Tabs>
    </div>
  ),
};
