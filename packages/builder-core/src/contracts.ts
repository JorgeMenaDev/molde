import type { FormDefinition, PgSchemaSnapshot } from "./schema";

export const desktopIpcChannels = {
  postgres: {
    testConnection: "postgres:testConnection",
    introspectSchema: "postgres:introspectSchema",
  },
  projects: {
    list: "projects:list",
    getLatest: "projects:getLatest",
    get: "projects:get",
    save: "projects:save",
    delete: "projects:delete",
  },
} as const;

export type ProjectSummary = {
  id: string;
  name: string;
  updatedAt: string;
};

export type PostgresConnectionInput = {
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  ssl: boolean;
};

export type DesktopApi = {
  postgres: {
    testConnection: (
      input: PostgresConnectionInput,
    ) => Promise<{ ok: boolean; message: string }>;
    introspectSchema: (
      input: PostgresConnectionInput,
    ) => Promise<PgSchemaSnapshot>;
  };
  projects: {
    list: () => Promise<ProjectSummary[]>;
    getLatest: () => Promise<FormDefinition | null>;
    get: (id: string) => Promise<FormDefinition | null>;
    save: (form: FormDefinition) => Promise<ProjectSummary>;
    delete: (id: string) => Promise<void>;
  };
};
