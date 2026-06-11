import {
  Archive,
  Bot,
  CheckCircle2,
  Database,
  ExternalLink,
  FileSearch,
  Globe,
  Grid2X2,
  HardDrive,
  Home,
  KeyRound,
  Layers3,
  Lock,
  MessageSquare,
  PanelRight,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Square,
  TerminalSquare,
  X,
} from "lucide-react";
import { defaultState, usePersistentSuciaNetState } from "./state.js";
import type { AppId, LauncherApp, SurfaceMode } from "./state.js";

function iconFor(app: LauncherApp, size = 22) {
  const props = { size, strokeWidth: 2.1 };
  if (app.icon === "home") return <Home {...props} />;
  if (app.icon === "lock") return <Lock {...props} />;
  if (app.icon === "bot") return <Bot {...props} />;
  if (app.icon === "layers") return <Layers3 {...props} />;
  if (app.icon === "database") return <Database {...props} />;
  if (app.icon === "drive") return <HardDrive {...props} />;
  if (app.icon === "shield") return <ShieldCheck {...props} />;
  if (app.icon === "settings") return <Settings {...props} />;
  return <Globe {...props} />;
}

function surfaceFor(appId: AppId): SurfaceMode {
  if (appId === "lock" || appId === "vault") return "lock-preview";
  if (appId === "agents") return "agents-preview";
  if (appId === "roadmap") return "roadmap-preview";
  if (appId === "settings" || appId === "audit") return "settings-preview";
  return "launcher";
}

function toneFor(app: LauncherApp) {
  if (app.status === "public demo" || app.status === "local" || app.status === "demo") return "good";
  if (app.status === "locked preview" || app.status === "locked" || app.status === "preview only") return "warn";
  return "idle";
}

function App() {
  const { state, setState, resetDemo, widgetAvailable } = usePersistentSuciaNetState();
  const selected = state.apps.find((app) => app.id === state.selectedAppId) ?? state.apps[0];
  const selectedRoadmap = state.roadmap.find((item) => item.id === state.selectedRoadmapId) ?? state.roadmap[0];
  const term = state.search.trim().toLowerCase();
  const visibleApps = state.apps.filter((app) => {
    if (state.groupFilter !== "All" && app.group !== state.groupFilter) return false;
    if (!term) return true;
    return [app.name, app.kind, app.group, app.status, app.summary].some((value) => value.toLowerCase().includes(term));
  });

  const statusCounts = {
    active: state.apps.filter((app) => app.enabled).length,
    locked: state.apps.filter((app) => !app.enabled).length,
    total: state.apps.length,
  };

  function selectApp(appId: AppId) {
    setState((current) => ({
      ...current,
      selectedAppId: appId,
      dockSelection: appId,
      activeSurface: surfaceFor(appId),
      lockPreviewOpen: appId === "lock" || appId === "vault",
      agentsPreviewOpen: appId === "agents",
    }));
  }

  function setGroupFilter(groupFilter: typeof state.groupFilter) {
    setState((current) => ({ ...current, groupFilter }));
  }

  return (
    <div className="app-shell launcher-shell">
      <aside className="icon-rail" aria-label="Sucia dock">
        <button className="brand-mark compact" aria-label="SuciaNet home" onClick={() => selectApp("access")}>S</button>
        {(["access", "lock", "agents", "roadmap", "settings"] as AppId[]).map((appId) => {
          const app = state.apps.find((item) => item.id === appId);
          if (!app) return null;
          return (
            <button key={app.id} className={state.selectedAppId === app.id ? "active" : ""} onClick={() => selectApp(app.id)} title={app.name}>
              {iconFor(app, 19)}
            </button>
          );
        })}
        <span className="rail-status good" title="Static website online" />
      </aside>

      <aside className="sidebar launcher-sidebar">
        <div className="brand-row">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand">SuciaNet</div>
            <div className="muted">SuciAccess web copy</div>
          </div>
        </div>

        <button className="primary-action" onClick={() => selectApp("access")}>
          <Grid2X2 size={16} />
          Open launcher
        </button>

        <section className="nav-section">
          <div className="section-label">Groups</div>
          {(["All", "Pinned", "Workspace", "Control"] as const).map((group) => (
            <button key={group} className={`conversation ${state.groupFilter === group ? "selected" : ""}`} onClick={() => setGroupFilter(group)}>
              <Square size={14} />
              <span>{group}</span>
              <small>{group === "All" ? state.apps.length : state.apps.filter((app) => app.group === group).length}</small>
            </button>
          ))}
        </section>

        <section className="nav-section">
          <div className="section-label">Pinned</div>
          {state.apps.filter((app) => app.group === "Pinned").map((app) => (
            <button key={app.id} className={`workspace-chip ${state.selectedAppId === app.id ? "active" : ""}`} onClick={() => selectApp(app.id)}>
              {iconFor(app, 16)}
              <span>{app.name}</span>
            </button>
          ))}
        </section>

        <section className="sidebar-footer">
          <div className="sidebar-footer-copy">
            <ShieldCheck size={16} />
            <span>Static public demo. Live actions are disabled.</span>
          </div>
          <div className="sidebar-auth-actions">
            <button disabled><KeyRound size={14} />Login later</button>
            <button onClick={resetDemo}><RefreshCw size={14} />Reset</button>
          </div>
        </section>
      </aside>

      <main className="launcher-main">
        <header className="topbar launcher-topbar">
          <div className="launcher-title">
            <div className="eyeline">SuciAccess launcher</div>
            <h1>SuciAccess command center</h1>
            <p>Static launcher preview.</p>
          </div>
          <div className="summary-pills">
            <span><CheckCircle2 size={14} />{statusCounts.active} demo active</span>
            <span><Lock size={14} />{statusCounts.locked} locked</span>
            <span><PanelRight size={14} />{widgetAvailable ? "widget host" : "web local"}</span>
          </div>
        </header>

        <section className="widget-strip" aria-label="Sucia status">
          <div className="home-widget good">
            <div className="widget-icon"><Lock size={18} /></div>
            <span>SuciLock</span>
            <strong>locked</strong>
          </div>
          <div className="home-widget warn">
            <div className="widget-icon"><Bot size={18} /></div>
            <span>SuciAgents</span>
            <strong>preview</strong>
          </div>
          <div className="home-widget good">
            <div className="widget-icon"><ShieldCheck size={18} /></div>
            <span>SuciAccess</span>
            <strong>public demo</strong>
          </div>
          <div className="home-widget warn">
            <div className="widget-icon"><TerminalSquare size={18} /></div>
            <span>Actions</span>
            <strong>disabled</strong>
          </div>
        </section>

        <section className="launcher-toolbar">
          <label className="search-box">
            <Search size={16} />
            <input value={state.search} onChange={(event) => setState((current) => ({ ...current, search: event.target.value }))} placeholder="Search Sucia surfaces" />
          </label>
          <div className="toolbar-meta">
            <span>{visibleApps.length} visible</span>
            <span>GitHub Pages ready</span>
            <span>No live mutation</span>
          </div>
        </section>

        {state.activeSurface !== "launcher" ? (
          <section className="preview-banner">
            <div>
              <strong>{selected.name}</strong>
              <span>{selected.detail}</span>
            </div>
            <button onClick={() => setState((current) => ({ ...current, activeSurface: "launcher" }))}><X size={15} />Close preview</button>
          </section>
        ) : null}

        <section className="app-grid" aria-label="Sucia apps">
          {visibleApps.map((app) => (
            <button key={app.id} className={`app-tile ${app.featured ? "pinned" : ""} ${!app.enabled ? "disabled" : ""} ${state.selectedAppId === app.id ? "selected" : ""}`} onClick={() => selectApp(app.id)}>
              <div className="tile-topline">
                <div className="tile-icon">{iconFor(app)}</div>
                <span>{app.group}</span>
              </div>
              <div className="tile-copy">
                <strong>{app.name}</strong>
                <span>{app.summary}</span>
              </div>
              <div className={`tile-status ${toneFor(app)}`}>{app.status}</div>
            </button>
          ))}
        </section>

        <section className="surface-preview" aria-live="polite">
          {state.activeSurface === "lock-preview" ? (
            <div className="locked-preview">
              <div className="preview-icon"><Lock size={26} /></div>
              <div>
                <span>Locked local surface</span>
                <strong>SuciLock is private on this PC</strong>
                <p>The public website does not reveal, copy, collect, or store vault data. Real unlock belongs in the desktop app later.</p>
              </div>
              <button disabled><KeyRound size={15} />Real unlock later</button>
            </div>
          ) : null}

          {state.activeSurface === "agents-preview" ? (
            <div className="agents-preview">
              <div className="preview-heading">
                <span>Disabled public preview</span>
                <strong>Core {"->"} 3 Nodes {"->"} 9 child slots</strong>
                <p>Agent orchestration stays local and approval-gated. This page never calls SuciAgents tools.</p>
              </div>
              {[1, 2, 3].map((node) => (
                <div key={node} className="node-preview">
                  <strong>Node {node}</strong>
                  <div>{[1, 2, 3].map((agent) => <span key={agent}>Agent {node}.{agent}</span>)}</div>
                </div>
              ))}
            </div>
          ) : null}

          {state.activeSurface === "roadmap-preview" ? (
            <div className="roadmap-preview">
              {state.roadmap.map((item, index) => (
                <button key={item.id} className={state.selectedRoadmapId === item.id ? "active" : ""} onClick={() => setState((current) => ({ ...current, selectedRoadmapId: item.id }))}>
                  <span>{index === 0 ? "root" : index === 1 ? "|--" : "\\--"}</span>
                  <strong>{item.label}</strong>
                  <small>{item.status}</small>
                </button>
              ))}
              <p>{selectedRoadmap.summary}</p>
            </div>
          ) : null}

          {state.activeSurface === "settings-preview" ? (
            <div className="settings-preview">
              <div><span>Mode</span><strong>Static public demo</strong></div>
              <div><span>Persistence</span><strong>{widgetAvailable ? "OpenAI widget state" : "localStorage fallback"}</strong></div>
              <div><span>Deployment</span><strong>GitHub Pages files only</strong></div>
              <div><span>Boundary</span><strong>No DNS, MX, auth, vault, or agent mutation</strong></div>
            </div>
          ) : null}
        </section>

        <nav className="launcher-dock" aria-label="Quick dock">
          {(["access", "lock", "agents", "settings"] as AppId[]).map((appId) => {
            const app = state.apps.find((item) => item.id === appId);
            if (!app) return null;
            return <button key={app.id} className={state.dockSelection === app.id ? "active" : ""} onClick={() => selectApp(app.id)}>{iconFor(app, 18)}<span>{app.name}</span></button>;
          })}
        </nav>
      </main>

      <aside className="inspector launcher-inspector">
        <section className="panel selected-panel">
          <div className="panel-title">
            {iconFor(selected, 18)}
            <div>
              <strong>{selected.name}</strong>
              <span>{selected.kind}</span>
            </div>
          </div>
          <div className="detail-list">
            <div><span>Status</span><strong>{selected.status}</strong></div>
            <div><span>Group</span><strong>{selected.group}</strong></div>
            <div><span>Mode</span><strong>{selected.enabled ? "static demo" : "disabled preview"}</strong></div>
          </div>
          <p>{selected.detail}</p>
          <div className="action-grid">
            <button disabled><ExternalLink size={14} />Open live</button>
            <button disabled><MessageSquare size={14} />Run action</button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title"><FileSearch size={16} />Guardrails</div>
          <div className="lane-list">
            <div className="lane selected"><span>No real login</span><small>Account auth is future work.</small></div>
            <div className="lane"><span>No private vault data</span><small>SuciLock remains a locked preview.</small></div>
            <div className="lane"><span>No agent mutation</span><small>SuciAgents is disabled on the public site.</small></div>
            <div className="lane"><span>No DNS writes</span><small>Domain setup is manual outside the app.</small></div>
          </div>
        </section>

        <section className="panel audit-panel">
          <div className="panel-title"><Archive size={16} />Demo audit</div>
          {["Launcher loaded", "Widget state checked", "Live actions disabled"].map((label, index) => (
            <div className="audit-row" key={label}>
              <span className={`dot ${index === 2 ? "bad" : "ok"}`} />
              <div><strong>{label}</strong><small>{index === 0 ? "static site" : index === 1 ? "feature-detected" : "public boundary"}</small></div>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}

export default App;
