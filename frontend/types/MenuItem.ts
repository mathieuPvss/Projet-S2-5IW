import type {MenuPermissions} from "@/enum/MenuPermissions";

export type MenuItem = {
  title: string; // The title of the menu item
  href?: string; // Optional URL for the menu item
  icon?: string; // Optional icon for the menu item
  permission?: MenuPermissions; // Optional permission required to access this item
  description?: string; // Optional description of the menu item
  children?: MenuItem[]; // Optional array of child menu items
}
