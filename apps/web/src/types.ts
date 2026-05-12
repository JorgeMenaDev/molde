import type { DesktopApi } from "@journey-builder/builder-core";

declare global {
  interface Window {
    journeyBuilder?: DesktopApi;
  }
}
