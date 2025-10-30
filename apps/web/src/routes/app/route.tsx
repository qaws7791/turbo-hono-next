import { Button } from "@repo/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { Icon } from "@repo/ui/icon";
import { Sidebar } from "@repo/ui/sidebar";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";

import type { NavItem } from "@repo/ui/sidebar";

const navItems: Array<NavItem> = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/app",
    icon: () => (
      <Icon
        name="solar--home-2-linear"
        type="iconify"
      />
    ),
  },
  {
    id: "learning-plans",
    label: "LearningPlans",
    href: "/app/learning-plans",
    icon: () => (
      <Icon
        name="solar--bookmark-square-minimalistic-linear"
        type="iconify"
      />
    ),
  },
];

export const Route = createFileRoute("/app")({
  component: AppLayoutComponent,
});

function AppLayoutComponent() {
  return (
    <div className="flex h-screen">
      <Sidebar className="hidden md:block">
        <Sidebar.Header>
          <Sidebar.Logo />
          <Sidebar.CloseButton />
        </Sidebar.Header>

        <Sidebar.Content>
          <Sidebar.Nav
            items={navItems}
            activeItem={"dashboard"}
          />
        </Sidebar.Content>
      </Sidebar>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-white border-b border-gray-200 p-2">
          <DialogTrigger>
            <Button
              variant="outline"
              size="icon"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
            <DialogOverlay>
              <DialogContent
                side="left"
                className="max-w-[256px] sm:max-w-[256px] p-0"
                closeButton={false}
              >
                {({ close }) => (
                  <>
                    <DialogHeader>
                      <DialogTitle hidden>Sign up</DialogTitle>
                    </DialogHeader>
                    <Sidebar onClose={() => close()}>
                      <Sidebar.Header>
                        <Sidebar.Logo />
                        <Sidebar.CloseButton />
                      </Sidebar.Header>

                      <Sidebar.Content>
                        <Sidebar.Nav
                          items={navItems}
                          activeItem={"dashboard"}
                        />
                      </Sidebar.Content>
                    </Sidebar>
                  </>
                )}
              </DialogContent>
            </DialogOverlay>
          </DialogTrigger>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
