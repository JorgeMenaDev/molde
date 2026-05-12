import type { DesktopApi } from "@molde/builder-core";

declare global {
  interface Window {
    molde?: DesktopApi;
  }
}
