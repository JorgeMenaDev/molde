import { createFormDefinition } from "@journey-builder/builder-core";
import { describe, expect, it, vi } from "vitest";

type FakeProject = {
  id: string;
  name: string;
  definitionJson: string;
  createdAt: string;
  updatedAt: string;
};

const projects = new Map<string, FakeProject>();

const latestProject = () =>
  [...projects.values()].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  )[0];

class FakeDatabase {
  pragma() {}
  exec() {}
  close() {}

  prepare(sql: string) {
    if (sql.startsWith("select id, name")) {
      return {
        all: () =>
          [...projects.values()].map((project) => ({
            id: project.id,
            name: project.name,
            updatedAt: project.updatedAt,
          })),
      };
    }

    if (sql.startsWith("select definition_json") && sql.includes("limit 1")) {
      return {
        get: () => {
          const project = latestProject();
          return project
            ? { definitionJson: project.definitionJson }
            : undefined;
        },
      };
    }

    if (sql.startsWith("select definition_json")) {
      return {
        get: (id: string) => {
          const project = projects.get(id);
          return project
            ? { definitionJson: project.definitionJson }
            : undefined;
        },
      };
    }

    if (sql.startsWith("delete")) {
      return {
        run: (id: string) => projects.delete(id),
      };
    }

    return {
      run: (project: FakeProject) => {
        projects.set(project.id, project);
      },
    };
  }
}

vi.mock("better-sqlite3", () => ({ default: FakeDatabase }));

describe("project store", () => {
  it("persists and loads form definitions", async () => {
    const { createProjectStore } = await import("./project-store");
    const directory = "/tmp/journey-builder-test";
    const store = createProjectStore(directory);
    const form = createFormDefinition("Intake");

    store.save(form);

    expect(store.list()).toEqual([
      { id: form.id, name: "Intake", updatedAt: form.updatedAt },
    ]);
    expect(store.get(form.id)).toMatchObject({ id: form.id, name: "Intake" });
    expect(store.getLatest()).toMatchObject({
      id: form.id,
      name: "Intake",
    });

    store.close();
  });
});
