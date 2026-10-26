import {
  createColumnHelper as createTanstackColumnHelper,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";

// The dashboard tables only lay rows out: sorting, filtering and paging happen
// in the Admin API, so no table features beyond the core are registered.
export const appTableFeatures = tableFeatures({});

export type AppTableFeatures = typeof appTableFeatures;

export type AppColumnDef<TData extends RowData> = ColumnDef<AppTableFeatures, TData, any>;

export const createColumnHelper = <TData extends RowData>() =>
  createTanstackColumnHelper<AppTableFeatures, TData>();
