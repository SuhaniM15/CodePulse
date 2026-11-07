import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SortDir } from '@/api/types';
import { cn } from '@/lib/utils';

/**
 * The one generic table. It is purely presentational and controlled:
 * sorting and pagination are driven by the parent (so they can be server-side).
 * Tables have square corners (no radius) by design.
 */
export interface DataTableColumn<Row> {
  /** Stable key. For sortable columns this is the value passed to onSortChange. */
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  /** Right-aligns the column and uses tabular numerals. */
  numeric?: boolean;
  sortable?: boolean;
}

export interface DataTableSort {
  key: string;
  dir: SortDir;
}

export interface DataTablePagination {
  /** 1-based. */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<Row> {
  /** Accessible name for the table. Required. */
  caption: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowId: (row: Row) => string;
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  pagination?: DataTablePagination;
  /** Shown instead of the body when there are no rows. */
  emptyMessage?: ReactNode;
  className?: string;
}

function ariaSort(
  sortable: boolean | undefined,
  sort: DataTableSort | undefined,
  key: string,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!sortable) return undefined;
  if (sort?.key !== key) return 'none';
  return sort.dir === 'asc' ? 'ascending' : 'descending';
}

export function DataTable<Row>({
  caption,
  columns,
  rows,
  getRowId,
  sort,
  onSortChange,
  pagination,
  emptyMessage = 'No rows to show.',
  className,
}: DataTableProps<Row>) {
  const lastPage = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
    : 1;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="border border-border bg-card">
        <Table>
          <caption className="sr-only">{caption}</caption>
          <TableHeader className="bg-canvas">
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                const SortIcon = !isSorted
                  ? ChevronsUpDown
                  : sort.dir === 'asc'
                    ? ChevronUp
                    : ChevronDown;
                return (
                  <TableHead
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort(col.sortable, sort, col.key)}
                    className={cn('px-3', col.numeric && 'text-right')}
                  >
                    {col.sortable && onSortChange ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          '-mx-2 font-semibold',
                          col.numeric && 'flex-row-reverse',
                        )}
                        onClick={() =>
                          onSortChange({
                            key: col.key,
                            dir: isSorted && sort.dir === 'desc' ? 'asc' : 'desc',
                          })
                        }
                      >
                        {col.header}
                        <SortIcon className="size-3.5" aria-hidden="true" />
                      </Button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="px-3 py-6 text-center whitespace-normal text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        'px-3 py-2.5',
                        col.numeric && 'text-right tabular-nums',
                      )}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination ? (
        <nav
          aria-label={`${caption} pagination`}
          className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"
        >
          <p className="tabular-nums" aria-live="polite">
            Page {pagination.page} of {lastPage}, {pagination.total} rows
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Previous page
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= lastPage}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Next page
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
