import {
  desktopIpcChannels,
  type DesktopApi,
} from "@journey-builder/builder-core";
import { contextBridge, ipcRenderer } from "electron";

const api = {
  postgres: {
    testConnection: (input) =>
      ipcRenderer.invoke(desktopIpcChannels.postgres.testConnection, input),
    introspectSchema: (input) =>
      ipcRenderer.invoke(desktopIpcChannels.postgres.introspectSchema, input),
  },
  projects: {
    list: () => ipcRenderer.invoke(desktopIpcChannels.projects.list),
    getLatest: () => ipcRenderer.invoke(desktopIpcChannels.projects.getLatest),
    get: (id) => ipcRenderer.invoke(desktopIpcChannels.projects.get, id),
    save: (form) => ipcRenderer.invoke(desktopIpcChannels.projects.save, form),
    delete: (id) => ipcRenderer.invoke(desktopIpcChannels.projects.delete, id),
  },
} satisfies DesktopApi;

contextBridge.exposeInMainWorld("journeyBuilder", api);
