import type { PgSchemaSnapshot } from "./schema";

export const fixtureSchemaSnapshot = {
  schemas: [
    {
      name: "public",
      tables: [
        {
          name: "customers",
          columns: [
            {
              schema: "public",
              table: "customers",
              column: "name",
              postgresType: "text",
              nullable: false,
              defaultValue: null,
            },
            {
              schema: "public",
              table: "customers",
              column: "status_id",
              postgresType: "uuid",
              nullable: false,
              defaultValue: null,
            },
          ],
          foreignKeys: [
            {
              column: "status_id",
              referencesSchema: "public",
              referencesTable: "customer_statuses",
              referencesColumn: "id",
            },
          ],
        },
        {
          name: "customer_statuses",
          columns: [
            {
              schema: "public",
              table: "customer_statuses",
              column: "id",
              postgresType: "uuid",
              nullable: false,
              defaultValue: null,
            },
            {
              schema: "public",
              table: "customer_statuses",
              column: "label",
              postgresType: "text",
              nullable: false,
              defaultValue: null,
            },
          ],
          foreignKeys: [],
        },
      ],
    },
  ],
} satisfies PgSchemaSnapshot;
