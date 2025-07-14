import type { MenuItem } from "@/types/MenuItem";
import { MenuPermissionsEnum } from "@/enums";

export const menuItems: MenuItem[] = [
  {
    title: "Accueil",
    href: "/",
    icon: "ic:baseline-home",
    permission: MenuPermissionsEnum.ALL,
  },
  {
    title: "Profil",
    href: "/profile",
    icon: "ic:baseline-person",
    permission: MenuPermissionsEnum.ALL,
  },
];
