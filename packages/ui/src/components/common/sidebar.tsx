"use client";

import { Home, MoreHorizontal, X } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Button,
  Link,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  composeRenderProps,
  type LinkProps as AriaLinkProps,
} from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { focusVisibleRing } from "../../utils";

// Variants
const sidebarVariants = tv({
  slots: {
    root: "w-full max-w-[256px] bg-background border-r border-border flex flex-col h-full",
    header: "px-4 py-5",
    headerContent: "flex items-center justify-between",
    logo: "flex items-center gap-3",
    logoIcon:
      "w-8 h-8 bg-primary rounded-full flex items-center justify-center",
    logoText: "text-foreground font-medium",
    closeButton:
      "p-1 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
    nav: "px-3 space-y-1",
    content: "flex-1 flex flex-col",
    footer: "p-3",
  },
});

const navItemVariants = tv({
  extend: focusVisibleRing,
  base: "w-full flex items-center justify-between px-3 py-2 rounded-md group font-medium transition-colors",
  variants: {
    isActive: {
      true: "bg-accent text-accent-foreground",
      false:
        "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    },
  },
  defaultVariants: {
    isActive: false,
  },
});

const userMenuVariants = tv({
  extend: focusVisibleRing,
  base: "w-full flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors",
});

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/app" },
];

// Types
type SidebarVariantProps = VariantProps<typeof sidebarVariants>;
type NavItemVariantProps = VariantProps<typeof navItemVariants>;
type UserMenuVariantProps = VariantProps<typeof userMenuVariants>;

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface SidebarHeaderProps {
  onClose?: () => void;
}

interface SidebarNavItemProps extends Omit<AriaLinkProps, "children"> {
  item: NavItem;
  isActive?: boolean;
}

interface SidebarContentProps {
  NAV_ITEMS: NavItem[];
  activeItem: string;
}

interface SidebarFooterProps {
  user: UserProfile;
}

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

// Internal Components
const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onClose }) => {
  const slots = sidebarVariants();

  return (
    <div className={slots.header()}>
      <div className={slots.headerContent()}>
        <div className={slots.logo()}>
          <div className={slots.logoIcon()}>
            <span className="text-white text-sm font-semibold">L</span>
          </div>
          <span className={slots.logoText()}>Lolog UI</span>
        </div>
        {onClose && (
          <Button
            onPress={onClose}
            className={composeRenderProps("", (className, renderProps) =>
              slots.closeButton({ ...renderProps, className }),
            )}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isActive = false,
  className,
  ...props
}) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={composeRenderProps(className, (className, renderProps) =>
        navItemVariants({ ...renderProps, isActive, className }),
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <Icon
          className="w-5 h-5"
          aria-hidden="true"
        />
        <span className="text-sm font-medium">{item.label}</span>
      </div>
    </Link>
  );
};

const SidebarContent: React.FC<SidebarContentProps> = ({
  NAV_ITEMS,
  activeItem,
}) => {
  const slots = sidebarVariants();

  return (
    <div className={slots.content()}>
      <nav
        className={slots.nav()}
        role="navigation"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
          />
        ))}
      </nav>
    </div>
  );
};

const SidebarFooter: React.FC<SidebarFooterProps> = ({ user }) => {
  const slots = sidebarVariants();

  return (
    <div className={slots.footer()}>
      <MenuTrigger>
        <Button
          className={composeRenderProps("", (className, renderProps) =>
            userMenuVariants({ ...renderProps, className }),
          )}
          aria-label={`User menu for ${user.name}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.name}'s avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-foreground">
                {user.name}
              </div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <MoreHorizontal
            className="w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
        <Popover placement="top end">
          <Menu className="w-48 bg-background rounded-lg shadow-lg border border-border py-1">
            <MenuItem className="px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer focus:bg-accent focus:text-accent-foreground outline-none">
              Profile Settings
            </MenuItem>
            <MenuItem className="px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer focus:bg-accent focus:text-accent-foreground outline-none">
              Account Settings
            </MenuItem>
            <MenuItem className="px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer focus:bg-accent focus:text-accent-foreground outline-none">
              Sign Out
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
    </div>
  );
};

// Main Sidebar Component
const Sidebar: React.FC<SidebarProps> = ({ className, onClose }) => {
  const pathname = usePathname();
  const slots = sidebarVariants();

  const user: UserProfile = {
    name: "Username",
    email: "username@email.com",
  };

  const activeItemId = NAV_ITEMS.find((item) => item.href === pathname)?.id;

  return (
    <aside
      className={slots.root({ className })}
      role="complementary"
      aria-label="Main sidebar"
    >
      <SidebarHeader onClose={onClose} />
      <SidebarContent
        NAV_ITEMS={NAV_ITEMS}
        activeItem={activeItemId || "home"}
      />
      <SidebarFooter user={user} />
    </aside>
  );
};

// Exports
export { Sidebar, sidebarVariants };
export type {
  NavItem,
  NavItemVariantProps,
  SidebarContentProps,
  SidebarFooterProps,
  SidebarNavItemProps,
  SidebarProps,
  SidebarVariantProps,
  UserMenuVariantProps,
  UserProfile,
};
