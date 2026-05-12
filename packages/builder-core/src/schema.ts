import { z } from "zod";

export const fieldTypeSchema = z.enum([
  "text",
  "textarea",
  "select",
  "checkbox",
  "radio",
]);

export const fieldTypes = fieldTypeSchema.options;

export const pgColumnRefSchema = z.object({
  schema: z.string().min(1),
  table: z.string().min(1),
  column: z.string().min(1),
  postgresType: z.string().min(1),
  nullable: z.boolean(),
  defaultValue: z.string().nullable(),
});

export const pgLookupSourceSchema = z.object({
  kind: z.literal("postgres"),
  table: z.object({
    schema: z.string().min(1),
    table: z.string().min(1),
  }),
  valueColumn: z.string().min(1),
  labelColumn: z.string().min(1),
});

export const staticOptionSourceSchema = z.object({
  kind: z.literal("static"),
  options: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .min(1),
});

export const optionSourceSchema = z.discriminatedUnion("kind", [
  staticOptionSourceSchema,
  pgLookupSourceSchema,
]);

export const fieldDefinitionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  label: z.string().min(1),
  type: fieldTypeSchema,
  required: z.boolean(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  databaseMapping: pgColumnRefSchema.nullable(),
  optionSource: optionSourceSchema.nullable(),
});

export const formDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.number().int().positive(),
  fields: z.array(fieldDefinitionSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const pgSchemaSnapshotSchema = z.object({
  schemas: z.array(
    z.object({
      name: z.string(),
      tables: z.array(
        z.object({
          name: z.string(),
          columns: z.array(pgColumnRefSchema),
          foreignKeys: z.array(
            z.object({
              column: z.string(),
              referencesSchema: z.string(),
              referencesTable: z.string(),
              referencesColumn: z.string(),
            }),
          ),
        }),
      ),
    }),
  ),
});

export type FieldType = z.infer<typeof fieldTypeSchema>;
export type ChoiceFieldType = Extract<FieldType, "select" | "radio">;
export type PgColumnRef = z.infer<typeof pgColumnRefSchema>;
export type OptionSource = z.infer<typeof optionSourceSchema>;
export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>;
export type FormDefinition = z.infer<typeof formDefinitionSchema>;
export type PgSchemaSnapshot = z.infer<typeof pgSchemaSnapshotSchema>;

export const isFieldType = (value: string): value is FieldType =>
  fieldTypeSchema.safeParse(value).success;

export const isChoiceFieldType = (type: FieldType): type is ChoiceFieldType =>
  type === "select" || type === "radio";

export const createDefaultStaticOptionSource = () =>
  ({
    kind: "static",
    options: [
      { label: "Option A", value: "a" },
      { label: "Option B", value: "b" },
    ],
  }) satisfies OptionSource;

export const getPgColumns = (snapshot: PgSchemaSnapshot) =>
  snapshot.schemas.flatMap((schema) =>
    schema.tables.flatMap((table) => table.columns),
  );

export const getPgColumnCount = (snapshot: PgSchemaSnapshot) =>
  getPgColumns(snapshot).length;

export const formatPgColumnRef = ({
  schema,
  table,
  column,
}: Pick<PgColumnRef, "schema" | "table" | "column">) =>
  `${schema}.${table}.${column}`;
