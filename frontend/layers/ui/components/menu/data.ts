import type {MenuItem} from "@/types/MenuItem";
import {MenuPermissionsEnum} from "@/enums";
export const menuItems: MenuItem[] = [
  {
    title: "Accueil",
    href: "/",
    icon: "ic:baseline-home",
    permission: MenuPermissionsEnum.ALL,
  },
  {
    title: "Admin",
    icon: "ic:baseline-admin-panel-settings",
    permission: MenuPermissionsEnum.ADMIN,
    children: [
      {
        title: "Projects",
        href: "/admin",
        description: "manage projects.",
        icon: "ic:baseline-web",
      },
      {
        title: "Dashboards",
        href: "/dashboard",
        description: "Data visualization and analysis.",
        icon: "ic:outline-space-dashboard",
      },
    ]
  },
  {
    title: "Favoris",
    href: "/favorites",
    icon: "ic:baseline-photo-library",
    permission: MenuPermissionsEnum.ALL,
  },
];

