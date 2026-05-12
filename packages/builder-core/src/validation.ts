import type { FieldDefinition, FormDefinition } from "./schema";
import { formDefinitionSchema, isChoiceFieldType } from "./schema";

export const validateFormDefinition = (form: unknown) =>
  formDefinitionSchema.safeParse(form);

export const getFieldIssues = (field: FieldDefinition) => {
  const issues: string[] = [];

  if (isChoiceFieldType(field.type) && !field.optionSource) {
    issues.push("Choice fields need an option source.");
  }

  if (
    field.optionSource?.kind === "static" &&
    field.optionSource.options.length === 0
  ) {
    issues.push("Static option sources need at least one option.");
  }

  if (
    field.databaseMapping &&
    field.databaseMapping.nullable === false &&
    !field.required
  ) {
    issues.push("Required database columns should use required fields.");
  }

  return issues;
};

export const getFormIssues = (form: FormDefinition) =>
  form.fields.flatMap((field) =>
    getFieldIssues(field).map((message) => ({
      fieldId: field.id,
      message,
    })),
  );
