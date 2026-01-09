import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@repo/ui/sidebar";
import {
  IconBook,
  IconCalendar,
  IconHome,
  IconTarget,
} from "@tabler/icons-react";
import { NavLink, useLocation } from "react-router";

import { UserMenu } from "./user-menu";

import type { AppShellUser } from "../model/types";

export function AppSidebar({
  user,
  onOpenSettings,
}: {
  user: AppShellUser;
  onOpenSettings: () => void;
}) {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenuItem className="flex items-center justify-between">
          <span className="ml-2">애플리케이션</span>
          <SidebarTrigger />
        </SidebarMenuItem>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={location.pathname.startsWith("/home")}
              render={<NavLink to="/home" />}
            >
              <IconHome />
              <span className="font-medium">홈</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={location.pathname.startsWith("/today")}
              render={<NavLink to="/today" />}
            >
              <IconCalendar />
              <span className="font-medium">오늘의 세션</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname.startsWith("/plans")}
                  render={<NavLink to="/plans" />}
                >
                  <IconTarget />
                  <span className="font-medium">학습 계획</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname.startsWith("/materials")}
                  render={<NavLink to="/materials" />}
                >
                  <IconBook />
                  <span className="font-medium">학습 자료</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserMenu
          user={user}
          onOpenSettings={onOpenSettings}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
