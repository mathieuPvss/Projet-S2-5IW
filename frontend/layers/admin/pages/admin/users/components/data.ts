import { h } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { Checkbox } from "@ui/components/checkbox";
import { Settings } from "lucide-vue-next";
import { DataTableColumnHeader } from "@ui/components/data-table";
import DataTableDropdown from "./DataTableDropdown.vue";
import type { User } from "@/entities";
import { Badge } from "@ui/components/badge";

export function getColumns(options: {
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}): ColumnDef<User>[] {
  return [
    {
      id: "select",
      header: ({ table }) =>
        h(Checkbox, {
          modelValue: table.getIsAllPageRowsSelected(),
          "onUpdate:modelValue": (value: boolean) =>
            table.toggleAllPageRowsSelected(value),
          ariaLabel: "Select all",
        }),
      cell: ({ row }) =>
        h(Checkbox, {
          modelValue: row.getIsSelected(),
          "onUpdate:modelValue": (value: boolean) => row.toggleSelected(value),
          ariaLabel: "Select row",
        }),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column: column,
          title: "ID",
        }),
      cell: ({ row }) =>
        h("div", { class: "font-mono text-sm" }, row.getValue("id")),
    },
    {
      accessorKey: "email",
      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column: column,
          title: "Email",
        }),
      cell: ({ row }) =>
        h("div", { class: "lowercase" }, row.getValue("email")),
    },
    {
      accessorKey: "role",
      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column: column,
          title: "Rôle",
        }),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        const isAdmin = role === "admin";
        const badgeText = isAdmin ? "Admin" : "User";
        const badgeColor = isAdmin
          ? "bg-purple-600 hover:bg-purple-700"
          : "bg-blue-600 hover:bg-blue-700";
        return h(Badge, { class: `${badgeColor}` }, () => [
          h("span", { class: "text-white" }, badgeText),
        ]);
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "actions",
      header: () =>
        h("div", { class: "flex items-center justify-center" }, [
          h(Settings, { class: "h-4 w-4" }),
        ]),
      enableHiding: false,
      cell: ({ row }) => {
        const userData = row.original;
        const isAdmin = userData.role === "admin";

        return h(
          "div",
          { class: "relative flex items-center justify-center" },
          h(DataTableDropdown, {
            userData,
            isAdmin,
            onEditUser: () => options.onEditUser(userData),
            onDeleteUser: () => options.onDeleteUser(userData),
          }),
        );
      },
    },
  ];
}
