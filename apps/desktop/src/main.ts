import { desktopIpcChannels } from "@journey-builder/builder-core";
import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "node:path";
import { createProjectStore } from "./project-store";
import { introspectPostgresSchema, testPostgresConnection } from "./postgres";

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: "#f4f1ea",
    title: "Journey Builder",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    void win.loadURL("http://127.0.0.1:5173");
    if (process.env.OPEN_DEVTOOLS === "1") {
      win.webContents.openDevTools({ mode: "detach" });
    }
    return;
  }

  void win.loadFile(join(app.getAppPath(), "../web/dist/index.html"));
};

app.whenReady().then(() => {
  const store = createProjectStore(app.getPath("userData"));

  ipcMain.handle(desktopIpcChannels.postgres.testConnection, (_event, input) =>
    testPostgresConnection(input),
  );
  ipcMain.handle(
    desktopIpcChannels.postgres.introspectSchema,
    (_event, input) => introspectPostgresSchema(input),
  );
  ipcMain.handle(desktopIpcChannels.projects.list, () => store.list());
  ipcMain.handle(desktopIpcChannels.projects.getLatest, () =>
    store.getLatest(),
  );
  ipcMain.handle(desktopIpcChannels.projects.get, (_event, id: string) =>
    store.get(id),
  );
  ipcMain.handle(desktopIpcChannels.projects.save, (_event, form) =>
    store.save(form),
  );
  ipcMain.handle(desktopIpcChannels.projects.delete, (_event, id: string) =>
    store.delete(id),
  );

  app.on("before-quit", () => store.close());

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
