"use client";

import { Home, MoreHorizontal, X } from "lucide-react";
import * as React from "react";
import {
  Button,
  Link,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  composeRenderProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";

import { focusVisibleRing } from "../../../utils";

import type { LinkProps as AriaLinkProps } from "react-aria-components";
import type { VariantProps } from "tailwind-variants";

// Context
interface SidebarContextValue {
  isCollapsed?: boolean;
  variant?: "default" | "compact";
  onClose?: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined,
);

const useSidebarContext = () => {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("Sidebar components must be used within a Sidebar");
  }
  return context;
};

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

// Default nav items (can be overridden via props)
const DEFAULT_NAV_ITEMS: Array<NavItem> = [
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

interface UserMenuItem {
  id: string;
  label: string;
  action: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Updated interfaces for composition
interface SidebarProps {
  className?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  isCollapsed?: boolean;
  variant?: "default" | "compact";
}

interface SidebarHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

interface SidebarLogoProps {
  src?: string;
  alt?: string;
  text?: string;
  href?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

interface SidebarCloseButtonProps {
  className?: string;
}

interface SidebarContentProps {
  children?: React.ReactNode;
  className?: string;
}

interface SidebarNavProps {
  items?: Array<NavItem>;
  activeItem?: string;
  onItemClick?: (item: NavItem) => void;
  renderItem?: (item: NavItem, isActive: boolean) => React.ReactNode;
  className?: string;
}

interface SidebarNavItemProps extends Omit<AriaLinkProps, "children"> {
  item: NavItem;
  isActive?: boolean;
}

interface SidebarFooterProps {
  children?: React.ReactNode;
  className?: string;
}

interface SidebarUserMenuProps {
  user: UserProfile;
  menuItems?: Array<UserMenuItem>;
  onMenuItemClick?: (action: string) => void;
  renderAvatar?: (user: UserProfile) => React.ReactNode;
  className?: string;
}

// Default user menu items
const DEFAULT_USER_MENU_ITEMS: Array<UserMenuItem> = [
  { id: "profile", label: "Profile Settings", action: "profile" },
  { id: "account", label: "Account Settings", action: "account" },
  { id: "signout", label: "Sign Out", action: "signout" },
];

// Sub-components
const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  children,
  className,
}) => {
  const slots = sidebarVariants();

  return (
    <div className={slots.header({ className })}>
      <div className={slots.headerContent()}>{children}</div>
    </div>
  );
};

const SidebarLogo: React.FC<SidebarLogoProps> = ({
  src,
  alt = "Logo",
  text = "Lolog UI",
  href,
  onClick,
  children,
  className,
}) => {
  const slots = sidebarVariants();

  const logoContent = children || (
    <>
      <div className={slots.logoIcon()}>
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-sm font-semibold">
            {text.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className={slots.logoText()}>{text}</span>
    </>
  );

  const logoProps = {
    className: slots.logo({ className }),
    onClick,
  };

  if (href) {
    return (
      <Link
        href={href}
        {...logoProps}
      >
        {logoContent}
      </Link>
    );
  }

  return <div {...logoProps}>{logoContent}</div>;
};

const SidebarCloseButton: React.FC<SidebarCloseButtonProps> = ({
  className,
}) => {
  const { onClose } = useSidebarContext();
  const slots = sidebarVariants();

  if (!onClose) return null;

  return (
    <Button
      onPress={onClose}
      className={composeRenderProps("", (classNameProp, renderProps) =>
        slots.closeButton({
          ...renderProps,
          className: className || classNameProp,
        }),
      )}
      aria-label="Close sidebar"
    >
      <X className="w-5 h-5" />
    </Button>
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
  children,
  className,
}) => {
  const slots = sidebarVariants();

  return <div className={slots.content({ className })}>{children}</div>;
};

const SidebarNav: React.FC<SidebarNavProps> = ({
  items = DEFAULT_NAV_ITEMS,
  activeItem,
  onItemClick,
  renderItem,
  className,
}) => {
  const slots = sidebarVariants();

  const currentActiveItem = activeItem;

  const handleItemClick = (item: NavItem) => {
    onItemClick?.(item);
  };

  return (
    <nav
      className={slots.nav({ className })}
      role="navigation"
      aria-label="Main navigation"
    >
      {items.map((item) => {
        const isActive = currentActiveItem === item.id;

        if (renderItem) {
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
            >
              {renderItem(item, isActive)}
            </div>
          );
        }

        return (
          <SidebarNavItem
            key={item.id}
            item={item}
            isActive={isActive}
            onPress={() => handleItemClick(item)}
          />
        );
      })}
    </nav>
  );
};

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  children,
  className,
}) => {
  const slots = sidebarVariants();

  return <div className={slots.footer({ className })}>{children}</div>;
};

const SidebarUserMenu: React.FC<SidebarUserMenuProps> = ({
  user,
  menuItems = DEFAULT_USER_MENU_ITEMS,
  onMenuItemClick,
  renderAvatar,
  className,
}) => {
  const handleMenuItemClick = (action: string) => {
    onMenuItemClick?.(action);
  };

  const avatarContent = renderAvatar ? (
    renderAvatar(user)
  ) : (
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
  );

  return (
    <MenuTrigger>
      <Button
        className={composeRenderProps("", (classNameProp, renderProps) =>
          userMenuVariants({
            ...renderProps,
            className: className || classNameProp,
          }),
        )}
        aria-label={`User menu for ${user.name}`}
      >
        <div className="flex items-center gap-3">
          {avatarContent}
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
          {menuItems.map((menuItem) => (
            <MenuItem
              key={menuItem.id}
              className="px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer focus:bg-accent focus:text-accent-foreground outline-none"
              onAction={() => handleMenuItemClick(menuItem.action)}
            >
              <div className="flex items-center gap-2">
                {menuItem.icon && <menuItem.icon className="w-4 h-4" />}
                {menuItem.label}
              </div>
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
};

// Main Sidebar Component with Composition
const SidebarRoot: React.FC<SidebarProps> = ({
  className,
  onClose,
  children,
  isCollapsed = false,
  variant = "default",
}) => {
  const slots = sidebarVariants();

  const contextValue = React.useMemo(
    () => ({ isCollapsed, variant, onClose }),
    [isCollapsed, variant, onClose],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <aside
        className={slots.root({ className })}
        role="complementary"
        aria-label="Main sidebar"
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
};

// Compound component with sub-components
const Sidebar = Object.assign(SidebarRoot, {
  Header: SidebarHeader,
  Logo: SidebarLogo,
  CloseButton: SidebarCloseButton,
  Content: SidebarContent,
  Nav: SidebarNav,
  Footer: SidebarFooter,
  UserMenu: SidebarUserMenu,
});

// Legacy component for backward compatibility
const LegacySidebar: React.FC<{
  className?: string;
  onClose?: () => void;
  user?: UserProfile;
  navItems?: Array<NavItem>;
  activeItem?: string;
}> = ({ className, onClose, user, navItems, activeItem }) => {
  const defaultUser: UserProfile = {
    name: "Username",
    email: "username@email.com",
  };

  return (
    <Sidebar
      className={className}
      onClose={onClose}
    >
      <Sidebar.Header>
        <Sidebar.Logo />
        <Sidebar.CloseButton />
      </Sidebar.Header>

      <Sidebar.Content>
        <Sidebar.Nav
          items={navItems}
          activeItem={activeItem}
        />
      </Sidebar.Content>

      <Sidebar.Footer>
        <Sidebar.UserMenu user={user || defaultUser} />
      </Sidebar.Footer>
    </Sidebar>
  );
};

// Exports
export {
  DEFAULT_NAV_ITEMS,
  DEFAULT_USER_MENU_ITEMS,
  LegacySidebar,
  Sidebar,
  sidebarVariants,
  useSidebarContext,
};
export type {
  NavItem,
  NavItemVariantProps,
  SidebarCloseButtonProps,
  SidebarContentProps,
  SidebarFooterProps,
  SidebarHeaderProps,
  SidebarLogoProps,
  SidebarNavItemProps,
  SidebarNavProps,
  SidebarProps,
  SidebarUserMenuProps,
  SidebarVariantProps,
  UserMenuItem,
  UserMenuVariantProps,
  UserProfile,
};
