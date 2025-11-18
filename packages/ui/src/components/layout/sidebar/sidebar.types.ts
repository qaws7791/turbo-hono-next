import type { LinkProps as AriaLinkProps } from "react-aria-components";

/**
 * Navigation item definition.
 */
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

/**
 * User profile information.
 */
export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

/**
 * User menu item definition.
 */
export interface UserMenuItem {
  id: string;
  label: string;
  action: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Props for the Sidebar root component.
 */
export interface SidebarProps {
  className?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  isCollapsed?: boolean;
  variant?: "default" | "compact";
}

/**
 * Props for SidebarHeader.
 */
export interface SidebarHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Props for SidebarLogo.
 */
export interface SidebarLogoProps {
  src?: string;
  alt?: string;
  text?: string;
  href?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Props for SidebarCloseButton.
 */
export interface SidebarCloseButtonProps {
  className?: string;
}

/**
 * Props for SidebarContent.
 */
export interface SidebarContentProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Props for SidebarNav.
 */
export interface SidebarNavProps {
  items?: Array<NavItem>;
  activeItem?: string;
  onItemClick?: (item: NavItem) => void;
  renderItem?: (item: NavItem, isActive: boolean) => React.ReactNode;
  className?: string;
}

/**
 * Props for SidebarNavItem.
 */
export interface SidebarNavItemProps extends Omit<AriaLinkProps, "children"> {
  item: NavItem;
  isActive?: boolean;
}

/**
 * Props for SidebarFooter.
 */
export interface SidebarFooterProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Props for SidebarUserMenu.
 */
export interface SidebarUserMenuProps {
  user: UserProfile;
  menuItems?: Array<UserMenuItem>;
  onMenuItemClick?: (action: string) => void;
  renderAvatar?: (user: UserProfile) => React.ReactNode;
  className?: string;
}
