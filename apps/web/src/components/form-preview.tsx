import type {
  FieldDefinition,
  FormDefinition,
} from "@journey-builder/builder-core";
import { getFormIssues } from "@journey-builder/builder-core";
import {
  Button,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@journey-builder/ui";

type FormPreviewProps = {
  form: FormDefinition;
};

const getStaticOptions = (field: FieldDefinition) =>
  field.optionSource?.kind === "static" ? field.optionSource.options : [];

const PreviewField = ({ field }: { field: FieldDefinition }) => {
  const name = field.title;

  if (field.type === "textarea") {
    return (
      <label className="grid gap-2">
        <Label>
          {field.label}
          {field.required ? " *" : ""}
        </Label>
        <Textarea placeholder={field.placeholder} />
        {field.helpText ? (
          <span className="text-xs text-zinc-500">{field.helpText}</span>
        ) : null}
      </label>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3">
        <Checkbox />
        <span className="text-sm font-medium">
          {field.label}
          {field.required ? " *" : ""}
        </span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <div className="grid gap-2">
        <Label>
          {field.label}
          {field.required ? " *" : ""}
        </Label>
        <Select name={name}>
          <SelectTrigger aria-label={`${field.label} select`}>
            <SelectValue placeholder="Select one" />
          </SelectTrigger>
          <SelectContent>
            {getStaticOptions(field).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <fieldset className="grid gap-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
          {field.label}
          {field.required ? " *" : ""}
        </legend>
        <div className="grid gap-2">
          {getStaticOptions(field).map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm"
            >
              <input name={name} type="radio" value={option.value} />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label className="grid gap-2">
      <Label>
        {field.label}
        {field.required ? " *" : ""}
      </Label>
      <Input name={name} placeholder={field.placeholder} />
      {field.helpText ? (
        <span className="text-xs text-zinc-500">{field.helpText}</span>
      ) : null}
    </label>
  );
};

export const FormPreview = ({ form }: FormPreviewProps) => {
  const issues = getFormIssues(form);

  return (
    <section className="grid-paper min-h-0 overflow-auto bg-[#f4f1ea] p-5">
      <div className="mx-auto max-w-xl border border-zinc-300 bg-white shadow-[8px_8px_0_#18181b]">
        <div className="border-b border-zinc-300 px-5 py-4">
          <p className="font-mono text-xs uppercase tracking-wide text-amber-700">
            Live preview
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-950">
            {form.name}
          </h2>
        </div>
        <form
          className="grid gap-5 p-5"
          onSubmit={(event) => event.preventDefault()}
          aria-label="Live form preview"
        >
          {form.fields.map((field) => (
            <PreviewField key={field.id} field={field} />
          ))}
          <Button type="submit">Preview submit</Button>
        </form>
        {issues.length > 0 ? (
          <div className="border-t border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">Mapping warnings</p>
            <ul className="mt-2 grid gap-1">
              {issues.map((issue) => (
                <li key={`${issue.fieldId}-${issue.message}`}>
                  {issue.message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
};
