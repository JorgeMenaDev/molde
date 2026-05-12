import {
  createDefaultStaticOptionSource,
  isChoiceFieldType,
  type FieldDefinition,
  type FieldType,
  type FormDefinition,
} from "./schema";

const nowIso = () => new Date().toISOString();

export const createField = (
  type: FieldType,
  index: number,
  overrides: Partial<FieldDefinition> = {},
): FieldDefinition => ({
  id: overrides.id ?? crypto.randomUUID(),
  title: overrides.title ?? `field_${index + 1}`,
  label: overrides.label ?? `Field ${index + 1}`,
  type,
  required: overrides.required ?? false,
  placeholder: overrides.placeholder,
  helpText: overrides.helpText,
  databaseMapping: overrides.databaseMapping ?? null,
  optionSource:
    overrides.optionSource ??
    (isChoiceFieldType(type) ? createDefaultStaticOptionSource() : null),
});

export const createFormDefinition = (
  name = "Untitled form",
  fields: FieldDefinition[] = [
    createField("text", 0, {
      title: "customer_name",
      label: "Customer name",
      required: true,
      placeholder: "Jane Doe",
    }),
    createField("select", 1, {
      title: "status",
      label: "Status",
    }),
  ],
): FormDefinition => {
  const createdAt = nowIso();

  return {
    id: crypto.randomUUID(),
    name,
    version: 1,
    fields,
    createdAt,
    updatedAt: createdAt,
  } satisfies FormDefinition;
};

export const normalizeField = (field: FieldDefinition) => ({
  ...field,
  title: field.title.trim().replaceAll(/\s+/g, "_").toLowerCase(),
  label: field.label.trim(),
  placeholder: field.placeholder?.trim() || undefined,
  helpText: field.helpText?.trim() || undefined,
  optionSource: isChoiceFieldType(field.type) ? field.optionSource : null,
});

export const normalizeForm = (form: FormDefinition) => ({
  ...form,
  fields: form.fields.map(normalizeField),
  updatedAt: nowIso(),
});
