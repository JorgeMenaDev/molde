import type {
  FieldDefinition,
  FieldType,
  PgColumnRef,
  PgSchemaSnapshot,
} from "@journey-builder/builder-core";
import {
  createDefaultStaticOptionSource,
  fieldTypes,
  formatPgColumnRef,
  getPgColumns,
  isChoiceFieldType,
  isFieldType,
} from "@journey-builder/builder-core";
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@journey-builder/ui";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type FieldGridProps = {
  fields: FieldDefinition[];
  schemaSnapshot: PgSchemaSnapshot;
  onAddField: (type: FieldType) => void;
  onChangeField: (id: string, patch: Partial<FieldDefinition>) => void;
  onDeleteField: (id: string) => void;
};

const columnHelper = createColumnHelper<FieldDefinition>();
const unmappedColumnValue = "unmapped";

const createColumnOption = (column: PgColumnRef) => {
  const label = formatPgColumnRef(column);
  return { key: label, label, column };
};

const getColumnOptions = (snapshot: PgSchemaSnapshot) =>
  getPgColumns(snapshot).map(createColumnOption);

export const FieldGrid = ({
  fields,
  schemaSnapshot,
  onAddField,
  onChangeField,
  onDeleteField,
}: FieldGridProps) => {
  const [openMappingFieldId, setOpenMappingFieldId] = useState<string | null>(
    null,
  );
  const columnOptions = useMemo(
    () => getColumnOptions(schemaSnapshot),
    [schemaSnapshot],
  );
  const columnByKey = useMemo(
    () => new Map(columnOptions.map((option) => [option.key, option])),
    [columnOptions],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Title",
        cell: ({ row, getValue }) => (
          <Input
            aria-label={`${row.original.label} title`}
            value={getValue()}
            onChange={(event) =>
              onChangeField(row.original.id, { title: event.target.value })
            }
          />
        ),
      }),
      columnHelper.accessor("label", {
        header: "Label",
        cell: ({ row, getValue }) => (
          <Input
            aria-label={`${row.original.title} label`}
            value={getValue()}
            onChange={(event) =>
              onChangeField(row.original.id, { label: event.target.value })
            }
          />
        ),
      }),
      columnHelper.accessor("type", {
        header: "Input",
        cell: ({ row, getValue }) => (
          <Select
            value={getValue()}
            onValueChange={(nextValue) => {
              if (!isFieldType(nextValue)) return;
              onChangeField(row.original.id, {
                type: nextValue,
                optionSource: isChoiceFieldType(nextValue)
                  ? (row.original.optionSource ??
                    createDefaultStaticOptionSource())
                  : null,
              });
            }}
          >
            <SelectTrigger aria-label={`${row.original.title} type`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      }),
      columnHelper.accessor("required", {
        header: "Req",
        cell: ({ row, getValue }) => (
          <div className="grid place-items-center">
            <Checkbox
              aria-label={`${row.original.title} required`}
              checked={getValue()}
              onCheckedChange={(checked) =>
                onChangeField(row.original.id, { required: checked === true })
              }
            />
          </div>
        ),
      }),
      columnHelper.accessor("databaseMapping", {
        header: "PostgreSQL column",
        cell: ({ row, getValue }) => {
          const selected = getValue();
          const value = selected
            ? formatPgColumnRef(selected)
            : unmappedColumnValue;
          const isOpen = openMappingFieldId === row.original.id;
          const visibleColumnOptions = isOpen
            ? columnOptions
            : selected
              ? [createColumnOption(selected)]
              : [];

          return (
            <Select
              value={value}
              onOpenChange={(open) =>
                setOpenMappingFieldId((current) =>
                  open
                    ? row.original.id
                    : current === row.original.id
                      ? null
                      : current,
                )
              }
              onValueChange={(nextValue) => {
                const match = columnByKey.get(nextValue);
                onChangeField(row.original.id, {
                  databaseMapping: match?.column ?? null,
                });
              }}
            >
              <SelectTrigger
                aria-label={`${row.original.title} database mapping`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={unmappedColumnValue}>Unmapped</SelectItem>
                {visibleColumnOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            aria-label={`Delete ${row.original.title}`}
            size="icon"
            variant="ghost"
            onClick={() => onDeleteField(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      }),
    ],
    [
      columnByKey,
      columnOptions,
      onChangeField,
      onDeleteField,
      openMappingFieldId,
    ],
  );

  const table = useReactTable({
    data: fields,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="flex min-h-0 flex-col border-r border-zinc-300 bg-zinc-50">
      <div className="flex items-center justify-between border-b border-zinc-300 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Field sheet
          </h2>
          <p className="text-xs text-zinc-500">
            {fields.length} fields mapped for v1
          </p>
        </div>
        <Select
          defaultValue="text"
          onValueChange={(value) => {
            if (isFieldType(value)) onAddField(value);
          }}
        >
          <SelectTrigger className="w-36" aria-label="Add field type">
            <Plus className="h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-h-0 overflow-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-r border-zinc-300 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="bg-white even:bg-zinc-50/70">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-b border-r border-zinc-200 p-1 align-top"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
