import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { hasOpenAIWidgetHost, readOpenAIWidgetState, writeOpenAIWidgetState } from "./openaiWidget.js";

export type AppId = "access" | "lock" | "agents" | "roadmap" | "vault" | "drive" | "audit" | "settings";
export type AppStatus = "public demo" | "locked preview" | "preview only" | "static" | "locked" | "offline" | "demo" | "local";
export type SurfaceMode = "launcher" | "lock-preview" | "agents-preview" | "roadmap-preview" | "settings-preview";

export type LauncherApp = {
  id: AppId;
  name: string;
  kind: string;
  group: "Pinned" | "Workspace" | "Control";
  icon: string;
  status: AppStatus;
  summary: string;
  detail: string;
  enabled: boolean;
  featured?: boolean;
};

export type RoadmapNode = {
  id: string;
  label: string;
  status: "ready" | "planning" | "pending";
  summary: string;
};

export type LauncherState = {
  selectedAppId: AppId;
  activeSurface: SurfaceMode;
  search: string;
  groupFilter: "All" | LauncherApp["group"];
  dockSelection: AppId;
  lockPreviewOpen: boolean;
  agentsPreviewOpen: boolean;
  selectedRoadmapId: string;
  guardrailPanelOpen: boolean;
  density: "desktop" | "compact";
  apps: LauncherApp[];
  roadmap: RoadmapNode[];
};

const STORAGE_KEY = "sucianet-launcher-v2";

export const defaultApps: LauncherApp[] = [
  {
    id: "access",
    name: "SuciAccess",
    kind: "Windows command center",
    group: "Pinned",
    icon: "home",
    status: "public demo",
    summary: "Public web copy of the SuciAccess desktop launcher.",
    detail: "This shell mirrors the desktop command center without real account login, local commands, or credential storage.",
    enabled: true,
    featured: true,
  },
  {
    id: "lock",
    name: "SuciLock",
    kind: "Secure vault",
    group: "Pinned",
    icon: "lock",
    status: "locked preview",
    summary: "Locked local vault preview.",
    detail: "SuciLock remains private and local. The public site only shows the locked shell and never stores or reveals vault data.",
    enabled: false,
    featured: true,
  },
  {
    id: "agents",
    name: "SuciAgents",
    kind: "Agent shell",
    group: "Pinned",
    icon: "bot",
    status: "preview only",
    summary: "Disabled public preview of the agent shell.",
    detail: "The public site shows neutral Core and Node capacity only. It does not call MCP tools, create plans, or mutate threads.",
    enabled: false,
    featured: true,
  },
  {
    id: "roadmap",
    name: "Roadmap",
    kind: "Planning tree",
    group: "Workspace",
    icon: "layers",
    status: "static",
    summary: "Static roadmap tree for the public demo.",
    detail: "The browser renders a simple roadmap.md -> GOAL.md -> plan.md preview without reading or writing project files.",
    enabled: true,
  },
  {
    id: "vault",
    name: "Vault",
    kind: "Private storage",
    group: "Workspace",
    icon: "database",
    status: "locked",
    summary: "Private storage surface placeholder.",
    detail: "Vault actions stay behind future account and device trust. This public page does not browse local files.",
    enabled: false,
  },
  {
    id: "drive",
    name: "Drive",
    kind: "Workspace files",
    group: "Workspace",
    icon: "drive",
    status: "offline",
    summary: "Offline file workspace preview.",
    detail: "Drive is represented as a disabled tile so the public site cannot read, sync, upload, or mutate files.",
    enabled: false,
  },
  {
    id: "audit",
    name: "Audit",
    kind: "Event log",
    group: "Control",
    icon: "shield",
    status: "demo",
    summary: "Demo audit surface.",
    detail: "Audit rows in this site are static explanatory events, not records from the desktop app or cloud services.",
    enabled: true,
  },
  {
    id: "settings",
    name: "Settings",
    kind: "Local controls",
    group: "Control",
    icon: "settings",
    status: "local",
    summary: "Public demo settings and guardrails.",
    detail: "Settings explain static mode, widget readiness, and the deployment boundary without changing DNS or accounts.",
    enabled: true,
  },
];

export const defaultRoadmapTree: RoadmapNode[] = [
  { id: "roadmap", label: "roadmap.md", status: "ready", summary: "Public top-level planning outline." },
  { id: "goal", label: "GOAL.md", status: "planning", summary: "Bounded implementation goal for the SuciaNet site." },
  { id: "plan", label: "plan.md", status: "pending", summary: "Future implementation slices stay approval-gated." },
];

export const defaultState: LauncherState = {
  selectedAppId: "access",
  activeSurface: "launcher",
  search: "",
  groupFilter: "All",
  dockSelection: "access",
  lockPreviewOpen: false,
  agentsPreviewOpen: false,
  selectedRoadmapId: "roadmap",
  guardrailPanelOpen: true,
  density: "desktop",
  apps: defaultApps,
  roadmap: defaultRoadmapTree,
};

function isLauncherState(value: unknown): value is Partial<LauncherState> {
  return Boolean(value && typeof value === "object");
}

function isAppId(value: unknown): value is AppId {
  return typeof value === "string" && defaultApps.some((app) => app.id === value);
}

function normalizeState(value: unknown): LauncherState {
  if (!isLauncherState(value)) return defaultState;
  const selectedAppId = isAppId(value.selectedAppId) ? value.selectedAppId : defaultState.selectedAppId;
  const dockSelection = isAppId(value.dockSelection) ? value.dockSelection : selectedAppId;
  const groupFilter =
    value.groupFilter === "Pinned" || value.groupFilter === "Workspace" || value.groupFilter === "Control"
      ? value.groupFilter
      : "All";
  const activeSurface =
    value.activeSurface === "lock-preview" ||
    value.activeSurface === "agents-preview" ||
    value.activeSurface === "roadmap-preview" ||
    value.activeSurface === "settings-preview"
      ? value.activeSurface
      : "launcher";

  return {
    ...defaultState,
    ...value,
    selectedAppId,
    dockSelection,
    groupFilter,
    activeSurface,
    search: typeof value.search === "string" ? value.search : "",
    apps: defaultApps.map((app) => {
      const persisted = Array.isArray(value.apps) ? value.apps.find((item) => item.id === app.id) : null;
      return persisted ? { ...app, status: persisted.status ?? app.status } : app;
    }),
    roadmap: defaultRoadmapTree,
    selectedRoadmapId: typeof value.selectedRoadmapId === "string" ? value.selectedRoadmapId : "roadmap",
    density: value.density === "compact" ? "compact" : "desktop",
    lockPreviewOpen: Boolean(value.lockPreviewOpen),
    agentsPreviewOpen: Boolean(value.agentsPreviewOpen),
    guardrailPanelOpen: value.guardrailPanelOpen !== false,
  };
}

function readLocalState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistLocalState(state: LauncherState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Static demo mode should keep rendering even when storage is unavailable.
  }
}

export function usePersistentSuciaNetState(): {
  state: LauncherState;
  setState: Dispatch<SetStateAction<LauncherState>>;
  resetDemo: () => void;
  widgetAvailable: boolean;
} {
  const widgetAvailable = useMemo(() => hasOpenAIWidgetHost(), []);
  const [state, setState] = useState<LauncherState>(() => normalizeState(readOpenAIWidgetState<LauncherState>() ?? readLocalState()));

  useEffect(() => {
    persistLocalState(state);
    writeOpenAIWidgetState(state);
  }, [state]);

  return {
    state,
    setState,
    resetDemo: () => setState(defaultState),
    widgetAvailable,
  };
}
