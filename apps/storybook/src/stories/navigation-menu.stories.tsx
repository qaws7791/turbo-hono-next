import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@repo/ui/navigation-menu";

import type { Meta, StoryObj } from "@storybook/react";


const meta = {
  title: "Components/NavigationMenu",
  component: NavigationMenu,
  tags: ["autodocs"],
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const resources = [
  {
    title: "Documentation",
    description: "Guides, API reference, and best practices.",
  },
  {
    title: "Components",
    description: "Browse all UI components and patterns.",
  },
  {
    title: "Tutorials",
    description: "Step-by-step examples and walkthroughs.",
  },
];

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 p-2 md:w-[400px]">
              {resources.map((resource) => (
                <li key={resource.title}>
                  <NavigationMenuLink
                    href="#"
                    className="flex flex-col"
                  >
                    <div className="text-sm font-medium">{resource.title}</div>
                    <p className="text-muted-foreground text-sm">
                      {resource.description}
                    </p>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#">Docs</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};
