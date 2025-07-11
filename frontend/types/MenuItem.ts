import type {MenuPermissionsEnum} from "@/enums";

export type MenuItem = {
  title: string; // The title of the menu item
  href?: string; // Optional URL for the menu item
  icon?: string; // Optional icon for the menu item
  permission?: MenuPermissionsEnum; // Optional permission required to access this item
  description?: string; // Optional description of the menu item
  children?: MenuItem[]; // Optional array of child menu items
}
