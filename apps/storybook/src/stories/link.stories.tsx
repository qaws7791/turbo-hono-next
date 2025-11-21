import { Link } from "@repo/ui/link";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Link component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation support (Enter to activate)
 * - ARIA attributes built-in for accessibility
 * - Can be styled as a button using button variants
 * - Supports internal and external links
 * - Accessible by default
 *
 * Common use cases:
 * - Navigation links
 * - Button-styled links (CTAs)
 * - Text links in content
 * - External resource links
 *
 * @see https://react-spectrum.adobe.com/react-aria/Link.html
 */
const meta = {
  title: "Components/Link",
  component: Link,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "outline",
        "destructive",
        "ghost",
        "link",
      ],
      description: "Visual style variant (optional, for button-styled links)",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
      description: "Size (optional, for button-styled links)",
    },
    children: {
      control: "text",
      description: "Link text content",
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default text link (no styling)
 */
export const Default: Story = {
  args: {
    href: "#",
    children: "Default Link",
  },
};

/**
 * Text link with custom styling
 */
export const TextLink: Story = {
  args: {
    href: "#",
    children: "Styled Text Link",
    className: "text-primary underline hover:no-underline",
  },
};

/**
 * Link styled as primary button
 */
export const PrimaryButton: Story = {
  args: {
    href: "#",
    variant: "primary",
    children: "Primary Link Button",
  },
};

/**
 * Link styled as secondary button
 */
export const SecondaryButton: Story = {
  args: {
    href: "#",
    variant: "secondary",
    children: "Secondary Link Button",
  },
};

/**
 * Link styled as outline button
 */
export const OutlineButton: Story = {
  args: {
    href: "#",
    variant: "outline",
    children: "Outline Link Button",
  },
};

/**
 * Link styled as destructive button
 */
export const DestructiveButton: Story = {
  args: {
    href: "#",
    variant: "destructive",
    children: "Destructive Link Button",
  },
};

/**
 * Link styled as ghost button
 */
export const GhostButton: Story = {
  args: {
    href: "#",
    variant: "ghost",
    children: "Ghost Link Button",
  },
};

/**
 * Link styled as link button
 */
export const LinkButton: Story = {
  args: {
    href: "#",
    variant: "link",
    children: "Link Button",
  },
};

/**
 * External link
 */
export const External: Story = {
  args: {
    href: "https://example.com",
    target: "_blank",
    rel: "noopener noreferrer",
    children: "External Link ↗",
    className: "text-primary underline hover:no-underline",
  },
};

/**
 * All button variants showcase
 */
export const AllButtonVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Link
        href="#"
        variant="primary"
      >
        Primary
      </Link>
      <Link
        href="#"
        variant="secondary"
      >
        Secondary
      </Link>
      <Link
        href="#"
        variant="outline"
      >
        Outline
      </Link>
      <Link
        href="#"
        variant="destructive"
      >
        Destructive
      </Link>
      <Link
        href="#"
        variant="ghost"
      >
        Ghost
      </Link>
      <Link
        href="#"
        variant="link"
      >
        Link
      </Link>
    </div>
  ),
};

/**
 * Button-styled links with different sizes
 */
export const ButtonSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Link
        href="#"
        variant="primary"
        size="sm"
      >
        Small
      </Link>
      <Link
        href="#"
        variant="primary"
        size="md"
      >
        Medium
      </Link>
      <Link
        href="#"
        variant="primary"
        size="lg"
      >
        Large
      </Link>
    </div>
  ),
};

/**
 * Links in text content
 */
export const InTextContent: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <p className="text-sm">
        This is a paragraph with an{" "}
        <Link
          href="#"
          className="text-primary underline hover:no-underline"
        >
          inline link
        </Link>{" "}
        that you can click. Links should be visually distinct from regular text.
      </p>
      <p className="text-sm">
        You can also visit our{" "}
        <Link
          href="https://example.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:no-underline"
        >
          documentation ↗
        </Link>{" "}
        for more information.
      </p>
    </div>
  ),
};

/**
 * Navigation menu with links
 */
export const NavigationMenu: Story = {
  render: () => (
    <nav className="rounded-lg border p-4">
      <ul className="space-y-2">
        <li>
          <Link
            href="#"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="#"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            About
          </Link>
        </li>
        <li>
          <Link
            href="#"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Products
          </Link>
        </li>
        <li>
          <Link
            href="#"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  ),
};

/**
 * Card with action link
 */
export const CardWithLink: Story = {
  render: () => (
    <div className="w-[350px] rounded-lg border p-6">
      <h3 className="mb-2 text-lg font-semibold">Feature Card</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Discover amazing features that will help you build better products.
      </p>
      <Link
        href="#"
        variant="primary"
      >
        Learn More
      </Link>
    </div>
  ),
};

/**
 * Footer links
 */
export const FooterLinks: Story = {
  render: () => (
    <footer className="w-[600px] rounded-lg border p-6">
      <div className="grid grid-cols-3 gap-6">
        <div>
          <h4 className="mb-3 text-sm font-semibold">Product</h4>
          <ul className="space-y-2">
            <li>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Roadmap
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2">
            <li>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Careers
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Support</h4>
          <ul className="space-y-2">
            <li>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Help Center
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Status
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  ),
};

/**
 * Breadcrumb navigation
 */
export const Breadcrumbs: Story = {
  render: () => (
    <nav className="flex items-center space-x-2 text-sm">
      <Link
        href="#"
        className="text-muted-foreground hover:text-foreground"
      >
        Home
      </Link>
      <span className="text-muted-foreground">/</span>
      <Link
        href="#"
        className="text-muted-foreground hover:text-foreground"
      >
        Products
      </Link>
      <span className="text-muted-foreground">/</span>
      <span className="text-foreground">Current Page</span>
    </nav>
  ),
};

/**
 * CTA section with links
 */
export const CTASection: Story = {
  render: () => (
    <div className="w-[500px] space-y-4 rounded-lg border bg-muted p-8 text-center">
      <h2 className="text-2xl font-bold">Ready to get started?</h2>
      <p className="text-muted-foreground">
        Join thousands of users already using our platform.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="#"
          variant="primary"
          size="lg"
        >
          Get Started
        </Link>
        <Link
          href="#"
          variant="outline"
          size="lg"
        >
          Learn More
        </Link>
      </div>
    </div>
  ),
};

/**
 * Social media links
 */
export const SocialLinks: Story = {
  render: () => (
    <div className="flex gap-4">
      <Link
        href="https://twitter.com"
        target="_blank"
        rel="noopener noreferrer"
        variant="ghost"
        isIconOnly
      >
        𝕏
      </Link>
      <Link
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        variant="ghost"
        isIconOnly
      >
        GitHub
      </Link>
      <Link
        href="https://linkedin.com"
        target="_blank"
        rel="noopener noreferrer"
        variant="ghost"
        isIconOnly
      >
        in
      </Link>
    </div>
  ),
};
