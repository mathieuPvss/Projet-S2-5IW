import { h } from 'vue'
import type {ColumnDef} from "@tanstack/vue-table";
import { Checkbox } from '@ui/components/checkbox';
import { Settings } from 'lucide-vue-next';
import { DataTableColumnHeader } from "@ui/components/data-table";
import DataTableDropdown from './DataTableDropdown.vue';
import type { Report } from '@/entities';
import { ReportStatus } from '@/enums/ReportStatus.enum';
import { Badge } from '@ui/components/badge';

export function getColumns(options: {
  onViewSource: (reportId: string, sourceId: string) => void;
  onViewUser: (userId: string) => void;
}): ColumnDef<Report>[] {
  return [
    {
      id: 'select',
      header: ({table}) => h(Checkbox, {
        'modelValue': table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean) => table.toggleAllPageRowsSelected(value),
        'ariaLabel': 'Select all',
      }),
      cell: ({row}) => h(Checkbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean) => row.toggleSelected(value),
        'ariaLabel': 'Select row',
      }),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "user_id",
      header: ({column}) => (
        h(DataTableColumnHeader, {
          column: column,
          title: 'User ID'
        })
      ),
      cell: ({row}) => h('div', {class: 'lowercase'}, row.original.user.email),
    },
    {
      accessorKey: "document_id",
      header: ({column}) => (
        h(DataTableColumnHeader, {
          column: column,
          title: 'Content ID'
        })
      ),
    },
    {
      accessorKey: "description",
      header: ({column}) => (
        h(DataTableColumnHeader, {
          column: column,
          title: 'Description'
        })
      ),
    },
    {
      accessorKey: "status",
      header: ({column}) => (
        h(DataTableColumnHeader, {
          column: column,
          title: 'Status'
        })
      ),
      cell: ({row}) => {
        const status = row.getValue('status');
        const badgeText = status === ReportStatus.PENDING ? 'Pending' :
          status === ReportStatus.APPROVED ? 'Approved' :
          status === ReportStatus.ERROR ? 'Error' :
          status === ReportStatus.REJECTED ? 'Rejected' :
          status === ReportStatus.CANCELLED ? 'Cancelled' :
          'Unknown';
        const badgeColor = status === ReportStatus.PENDING ? 'bg-blue-600 hover:bg-blue-700' :
          status === ReportStatus.APPROVED ? 'bg-emerald-600 hover:bg-emerald-700' :
          status === ReportStatus.ERROR ? 'bg-red-600 hover:bg-red-700' :
          status === ReportStatus.REJECTED ? 'bg-yellow-500 hover:bg-yellow-600' :
          status === ReportStatus.CANCELLED ? 'bg-gray-300 hover:bg-gray-400' :
          'bg-black';
        return h(Badge, { class: `${badgeColor}` }, () => [
          h('span', { class: 'text-white' }, badgeText)
        ]);
      }
    },
    {
      id: 'actions',
      header: () => h('div', {class: 'flex items-center justify-center'}, [
        h(Settings, {class: 'h-4 w-4'}),
      ]),
      enableHiding: false,
      cell: ({row}) => {
        const rowData = row.original;

        return h('div', {class: 'relative flex items-center justify-center'}, h(DataTableDropdown, {
          rowData,
          onViewUser: (userId: string) => options.onViewUser(userId),
          onViewSource: (reportId: string, sourceId: string) => options.onViewSource(reportId, sourceId),
        }));
      },
    },
  ]
}
