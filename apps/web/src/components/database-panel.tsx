import {
  getPgColumnCount,
  type DesktopApi,
  type PgSchemaSnapshot,
  type PostgresConnectionInput,
} from "@molde/builder-core";
import { Button, Checkbox, Input, Label } from "@molde/ui";
import { Database, PlugZap } from "lucide-react";
import { useMemo, useState } from "react";

type DatabasePanelProps = {
  desktopApi?: DesktopApi;
  schemaSnapshot: PgSchemaSnapshot;
  onSchemaSnapshot: (snapshot: PgSchemaSnapshot) => void;
};

const initialConnection = {
  host: "localhost",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "",
  ssl: false,
} satisfies PostgresConnectionInput;

export const DatabasePanel = ({
  desktopApi,
  schemaSnapshot,
  onSchemaSnapshot,
}: DatabasePanelProps) => {
  const [connection, setConnection] =
    useState<PostgresConnectionInput>(initialConnection);
  const [status, setStatus] = useState(
    desktopApi
      ? "Electron bridge ready. Connect to introspect PostgreSQL."
      : "Web mode uses fixture schema data. Open the Electron app for live PostgreSQL introspection.",
  );
  const columnCount = useMemo(
    () => getPgColumnCount(schemaSnapshot),
    [schemaSnapshot],
  );

  const updateConnection = (patch: Partial<PostgresConnectionInput>) =>
    setConnection((current) => ({ ...current, ...patch }));

  const testConnection = async () => {
    if (!desktopApi) return;
    const result = await desktopApi.postgres.testConnection(connection);
    setStatus(result.message);
  };

  const introspect = async () => {
    if (!desktopApi) return;
    const snapshot = await desktopApi.postgres.introspectSchema(connection);
    const nextColumnCount = getPgColumnCount(snapshot);
    onSchemaSnapshot(snapshot);
    setStatus(
      `Loaded ${snapshot.schemas.length} schemas and ${nextColumnCount} known columns.`,
    );
  };

  return (
    <aside className="border-b border-zinc-300 bg-zinc-950 px-4 py-3 text-zinc-50">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-amber-300" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              PostgreSQL mapping
            </h2>
            <span className="font-mono text-xs text-zinc-400">
              {columnCount} columns
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
            <label className="grid gap-1">
              <Label className="text-zinc-300">Host</Label>
              <Input
                value={connection.host}
                onChange={(event) =>
                  updateConnection({ host: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1">
              <Label className="text-zinc-300">Port</Label>
              <Input
                type="number"
                value={connection.port}
                onChange={(event) =>
                  updateConnection({ port: Number(event.target.value) })
                }
              />
            </label>
            <label className="grid gap-1">
              <Label className="text-zinc-300">Database</Label>
              <Input
                value={connection.database}
                onChange={(event) =>
                  updateConnection({ database: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1">
              <Label className="text-zinc-300">User</Label>
              <Input
                value={connection.user}
                onChange={(event) =>
                  updateConnection({ user: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1">
              <Label className="text-zinc-300">Password</Label>
              <Input
                type="password"
                value={connection.password}
                onChange={(event) =>
                  updateConnection({ password: event.target.value })
                }
              />
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <Checkbox
                checked={connection.ssl}
                onCheckedChange={(checked) =>
                  updateConnection({ ssl: checked === true })
                }
              />
              SSL
            </label>
          </div>
          <p className="mt-2 text-xs text-zinc-400">{status}</p>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={!desktopApi}
            variant="secondary"
            onClick={testConnection}
          >
            <PlugZap className="h-4 w-4" />
            Test
          </Button>
          <Button disabled={!desktopApi} onClick={introspect}>
            Introspect
          </Button>
        </div>
      </div>
    </aside>
  );
};
