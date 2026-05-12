import type {
  PgSchemaSnapshot,
  PostgresConnectionInput,
} from "@journey-builder/builder-core";
import { pgSchemaSnapshotSchema } from "@journey-builder/builder-core";
import { Client } from "pg";

type ColumnRow = {
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: "YES" | "NO";
  column_default: string | null;
};

type ForeignKeyRow = {
  table_schema: string;
  table_name: string;
  column_name: string;
  foreign_table_schema: string;
  foreign_table_name: string;
  foreign_column_name: string;
};

const columnQuery = `
  select
    table_schema,
    table_name,
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
  from information_schema.columns
  where table_schema not in ('pg_catalog', 'information_schema')
  order by table_schema, table_name, ordinal_position;
`;

const foreignKeyQuery = `
  select
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema as foreign_table_schema,
    ccu.table_name as foreign_table_name,
    ccu.column_name as foreign_column_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name
    and tc.table_schema = kcu.table_schema
  join information_schema.constraint_column_usage ccu
    on ccu.constraint_name = tc.constraint_name
    and ccu.table_schema = tc.table_schema
  where tc.constraint_type = 'FOREIGN KEY'
    and tc.table_schema not in ('pg_catalog', 'information_schema')
    and ccu.table_schema not in ('pg_catalog', 'information_schema');
`;

const createClient = (input: PostgresConnectionInput) =>
  new Client({
    host: input.host,
    port: input.port,
    database: input.database,
    user: input.user,
    password: input.password,
    ssl: input.ssl ? { rejectUnauthorized: false } : undefined,
  });

export const buildSchemaSnapshot = (
  columnRows: ColumnRow[],
  foreignKeyRows: ForeignKeyRow[],
) => {
  const schemaMap = new Map<
    string,
    Map<string, PgSchemaSnapshot["schemas"][number]["tables"][number]>
  >();

  for (const row of columnRows) {
    const tables = schemaMap.get(row.table_schema) ?? new Map();
    const table = tables.get(row.table_name) ?? {
      name: row.table_name,
      columns: [],
      foreignKeys: [],
    };

    table.columns.push({
      schema: row.table_schema,
      table: row.table_name,
      column: row.column_name,
      postgresType:
        row.data_type === "USER-DEFINED" ? row.udt_name : row.data_type,
      nullable: row.is_nullable === "YES",
      defaultValue: row.column_default,
    });

    tables.set(row.table_name, table);
    schemaMap.set(row.table_schema, tables);
  }

  for (const row of foreignKeyRows) {
    const table = schemaMap.get(row.table_schema)?.get(row.table_name);
    if (!table) continue;

    table.foreignKeys.push({
      column: row.column_name,
      referencesSchema: row.foreign_table_schema,
      referencesTable: row.foreign_table_name,
      referencesColumn: row.foreign_column_name,
    });
  }

  const snapshot = {
    schemas: [...schemaMap.entries()].map(([name, tables]) => ({
      name,
      tables: [...tables.values()],
    })),
  };

  return pgSchemaSnapshotSchema.parse(snapshot);
};

export const testPostgresConnection = async (
  input: PostgresConnectionInput,
) => {
  const client = createClient(input);

  try {
    await client.connect();
    await client.query("select 1");
    return { ok: true, message: "Connected to PostgreSQL." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to connect to PostgreSQL.",
    };
  } finally {
    await client.end().catch(() => undefined);
  }
};

export const introspectPostgresSchema = async (
  input: PostgresConnectionInput,
) => {
  const client = createClient(input);

  try {
    await client.connect();
    const [columns, foreignKeys] = await Promise.all([
      client.query<ColumnRow>(columnQuery),
      client.query<ForeignKeyRow>(foreignKeyQuery),
    ]);

    return buildSchemaSnapshot(columns.rows, foreignKeys.rows);
  } finally {
    await client.end().catch(() => undefined);
  }
};
