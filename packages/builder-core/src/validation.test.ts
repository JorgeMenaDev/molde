import { describe, expect, it } from "vitest";
import { createField, createFormDefinition, normalizeField } from "./factory";
import { getFieldIssues, validateFormDefinition } from "./validation";

describe("builder core", () => {
  it("creates valid form definitions", () => {
    const form = createFormDefinition();

    expect(validateFormDefinition(form).success).toBe(true);
  });

  it("normalizes field names without changing choice options", () => {
    const field = createField("select", 0, {
      title: " Customer Status ",
      label: " Customer status ",
    });

    expect(normalizeField(field)).toMatchObject({
      title: "customer_status",
      label: "Customer status",
      optionSource: field.optionSource,
    });
  });

  it("flags nullable mismatches for database mappings", () => {
    const field = createField("text", 0, {
      required: false,
      databaseMapping: {
        schema: "public",
        table: "customers",
        column: "name",
        postgresType: "text",
        nullable: false,
        defaultValue: null,
      },
    });

    expect(getFieldIssues(field)).toContain(
      "Required database columns should use required fields.",
    );
  });
});
