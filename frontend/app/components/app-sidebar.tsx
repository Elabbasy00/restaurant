import * as React from "react";
import {
  BookOpen,
  Command,
  GalleryVerticalEnd,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "~/components/nav-main";

import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";

// This is sample data.
const data = {
  teams: [
    {
      name: "Sina star",
      logo: GalleryVerticalEnd,
      plan: "",
    },
  ],
  navMain: [
    {
      title: "الرئيسية",
      url: "/dashboard",
      icon: Command,
      standalone: true,
    },
    {
      title: "المنيو",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "المطعم",
          url: "/dashboard/menu",
        },
        {
          title: "الخدمات",
          url: "/dashboard/services",
        },
      ],
    },
    // {
    //   title: "Stocks",
    //   url: "#",
    //   icon: Bot,
    //   items: [
    //     {
    //       title: "Ingredients",
    //       url: "/ingredients",
    //     },
    //   ],
    // },
    {
      title: "الطلبات",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "كل الطلبات",
          url: "/dashboard/orders",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar side="right" collapsible="icon" {...props} dir="rtl">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
