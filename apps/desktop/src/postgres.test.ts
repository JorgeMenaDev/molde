import { describe, expect, it } from "vitest";
import { buildSchemaSnapshot } from "./postgres";

describe("buildSchemaSnapshot", () => {
  it("groups columns and foreign keys by schema and table", () => {
    const snapshot = buildSchemaSnapshot(
      [
        {
          table_schema: "public",
          table_name: "customers",
          column_name: "status_id",
          data_type: "uuid",
          udt_name: "uuid",
          is_nullable: "NO",
          column_default: null,
        },
      ],
      [
        {
          table_schema: "public",
          table_name: "customers",
          column_name: "status_id",
          foreign_table_schema: "public",
          foreign_table_name: "customer_statuses",
          foreign_column_name: "id",
        },
      ],
    );

    expect(snapshot.schemas[0]?.tables[0]).toMatchObject({
      name: "customers",
      columns: [{ column: "status_id", nullable: false }],
      foreignKeys: [{ referencesTable: "customer_statuses" }],
    });
  });
});
