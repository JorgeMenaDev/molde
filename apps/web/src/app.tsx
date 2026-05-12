import {
  createField,
  createFormDefinition,
  fixtureSchemaSnapshot,
  formDefinitionSchema,
  normalizeForm,
  type DesktopApi,
  type FieldDefinition,
  type FieldType,
  type FormDefinition,
  type PgSchemaSnapshot,
} from "@molde/builder-core";
import { Button, Input } from "@molde/ui";
import { Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DatabasePanel } from "./components/database-panel";
import { FieldGrid } from "./components/field-grid";
import { FormPreview } from "./components/form-preview";

const storedFormKey = "molde:last-form";

const touchForm = (form: FormDefinition) => ({
  ...form,
  updatedAt: new Date().toISOString(),
});

const createInitialForm = () => {
  const fallback = () => createFormDefinition("Customer intake");

  if (window.molde) return fallback();

  try {
    const storedForm = localStorage.getItem(storedFormKey);
    if (!storedForm) return fallback();
    const parsed = formDefinitionSchema.safeParse(JSON.parse(storedForm));
    return parsed.success ? parsed.data : fallback();
  } catch {
    return fallback();
  }
};

export const App = () => {
  const desktopApi = window.molde;
  const [form, setForm] = useState<FormDefinition>(createInitialForm);
  const [schemaSnapshot, setSchemaSnapshot] = useState<PgSchemaSnapshot>(
    fixtureSchemaSnapshot,
  );
  const [saveStatus, setSaveStatus] = useState("Not saved");
  const canUseDesktop = useMemo(() => Boolean(desktopApi), [desktopApi]);

  useEffect(() => {
    const loadLatestProject = async (api: DesktopApi) => {
      const project = await api.projects.getLatest();
      if (project) setForm(project);
    };

    if (desktopApi) void loadLatestProject(desktopApi);
  }, [desktopApi]);

  const updateFormName = useCallback((name: string) => {
    setForm((current) => touchForm({ ...current, name }));
  }, []);

  const addField = useCallback((type: FieldType) => {
    setForm((current) =>
      touchForm({
        ...current,
        fields: [...current.fields, createField(type, current.fields.length)],
      }),
    );
  }, []);

  const changeField = useCallback(
    (id: string, patch: Partial<FieldDefinition>) => {
      setForm((current) =>
        touchForm({
          ...current,
          fields: current.fields.map((field) =>
            field.id === id ? { ...field, ...patch } : field,
          ),
        }),
      );
    },
    [],
  );

  const deleteField = useCallback((id: string) => {
    setForm((current) =>
      touchForm({
        ...current,
        fields: current.fields.filter((field) => field.id !== id),
      }),
    );
  }, []);

  const saveProject = async () => {
    const normalizedForm = normalizeForm(form);
    setForm(normalizedForm);

    if (!desktopApi) {
      localStorage.setItem(storedFormKey, JSON.stringify(normalizedForm));
      setSaveStatus("Saved to browser storage");
      return;
    }

    const project = await desktopApi.projects.save(normalizedForm);
    setSaveStatus(`Saved ${project.name}`);
  };

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#f4f1ea] text-zinc-950">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-300 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="icon-192.png"
            alt=""
            aria-hidden="true"
            className="h-10 w-10 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-wide text-zinc-500">
              Open-source builder
            </p>
            <Input
              aria-label="Form name"
              className="h-auto border-0 bg-transparent p-0 text-xl font-semibold focus:ring-0"
              value={form.name}
              onChange={(event) => updateFormName(event.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-zinc-500">
            {canUseDesktop ? "Electron + SQLite" : "Web fixture mode"}
          </span>
          <span className="font-mono text-xs text-zinc-500">{saveStatus}</span>
          <Button onClick={saveProject}>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </header>
      <DatabasePanel
        desktopApi={desktopApi}
        schemaSnapshot={schemaSnapshot}
        onSchemaSnapshot={setSchemaSnapshot}
      />
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(620px,1.25fr)_minmax(360px,0.75fr)]">
        <FieldGrid
          fields={form.fields}
          schemaSnapshot={schemaSnapshot}
          onAddField={addField}
          onChangeField={changeField}
          onDeleteField={deleteField}
        />
        <FormPreview form={form} />
      </div>
    </main>
  );
};
