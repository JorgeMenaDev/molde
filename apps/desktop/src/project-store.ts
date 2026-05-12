import {
  formDefinitionSchema,
  type FormDefinition,
  type ProjectSummary,
} from "@journey-builder/builder-core";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

export type ProjectStore = {
  list: () => ProjectSummary[];
  getLatest: () => FormDefinition | null;
  get: (id: string) => FormDefinition | null;
  save: (form: FormDefinition) => ProjectSummary;
  delete: (id: string) => void;
  close: () => void;
};

export const createProjectStore = (directory: string): ProjectStore => {
  mkdirSync(directory, { recursive: true });
  const db = new Database(join(directory, "projects.sqlite"));

  db.pragma("journal_mode = WAL");
  db.exec(`
    create table if not exists projects (
      id text primary key,
      name text not null,
      definition_json text not null,
      created_at text not null,
      updated_at text not null
    );

    create table if not exists connection_profiles (
      id text primary key,
      name text not null,
      host text not null,
      port integer not null,
      database_name text not null,
      username text not null,
      ssl integer not null,
      updated_at text not null
    );

    create table if not exists schema_snapshots (
      id text primary key,
      connection_profile_id text,
      snapshot_json text not null,
      created_at text not null
    );

    create index if not exists projects_updated_at_idx
      on projects(updated_at desc);
  `);

  const listProjects = db.prepare(
    "select id, name, updated_at as updatedAt from projects order by updated_at desc",
  );
  const getLatestProject = db.prepare(
    "select definition_json as definitionJson from projects order by updated_at desc limit 1",
  );
  const getProject = db.prepare(
    "select definition_json as definitionJson from projects where id = ?",
  );
  const saveProject = db.prepare(`
    insert into projects (id, name, definition_json, created_at, updated_at)
    values (@id, @name, @definitionJson, @createdAt, @updatedAt)
    on conflict(id) do update set
      name = excluded.name,
      definition_json = excluded.definition_json,
      updated_at = excluded.updated_at
  `);
  const deleteProjectStatement = db.prepare(
    "delete from projects where id = ?",
  );

  const parseProjectRow = (row: { definitionJson: string } | undefined) =>
    row ? formDefinitionSchema.parse(JSON.parse(row.definitionJson)) : null;

  const list = () => listProjects.all() as ProjectSummary[];

  const getLatest = () =>
    parseProjectRow(
      getLatestProject.get() as { definitionJson: string } | undefined,
    );

  const get = (id: string) => {
    return parseProjectRow(
      getProject.get(id) as { definitionJson: string } | undefined,
    );
  };

  const save = (form: FormDefinition) => {
    const parsed = formDefinitionSchema.parse(form);

    saveProject.run({
      id: parsed.id,
      name: parsed.name,
      definitionJson: JSON.stringify(parsed),
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });

    return {
      id: parsed.id,
      name: parsed.name,
      updatedAt: parsed.updatedAt,
    };
  };

  const deleteProject = (id: string) => {
    deleteProjectStatement.run(id);
  };

  const close = () => db.close();

  return {
    list,
    getLatest,
    get,
    save,
    delete: deleteProject,
    close,
  };
};
