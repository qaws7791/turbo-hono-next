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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@repo/ui/sidebar";
import { IconHome, IconNotebook, IconSearch } from "@tabler/icons-react";
import { NavLink, useLocation } from "react-router";

import { UserMenu } from "./user-menu";

import type { Space, User } from "~/mock/schemas";

import {
  getColorByName,
  getIconByName,
} from "~/features/spaces/icon-color-picker";

export function AppSidebar({
  user,
  spaces,
  onOpenSettings,
  onOpenCommandPalette,
}: {
  user: User;
  spaces: Array<Space>;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
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
              isActive={location.pathname.startsWith("/concepts")}
              onClick={onOpenCommandPalette}
              className="cursor-pointer"
            >
              <IconSearch />
              <span className="font-medium">검색</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={location.pathname.startsWith("/concepts")}
              render={<NavLink to="/concepts" />}
            >
              <IconNotebook />
              <span className="font-medium">개념</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<NavLink to="/spaces" />}>
                  스페이스
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuSub className="ml-0 border-l-0">
                {spaces.map((space) => {
                  const SpaceIconComponent = getIconByName(
                    space.icon ?? "book",
                  );
                  const colorData = getColorByName(space.color ?? "blue");
                  return (
                    <SidebarMenuSubItem key={space.id}>
                      <SidebarMenuSubButton
                        isActive={location.pathname.startsWith(
                          `/spaces/${space.id}`,
                        )}
                        render={<NavLink to={`/spaces/${space.id}`} />}
                      >
                        <SpaceIconComponent
                          className="size-4 shrink-0"
                          style={{ color: colorData?.value }}
                        />
                        <span className="truncate">{space.name}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
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
