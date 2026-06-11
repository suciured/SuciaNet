type OpenAIWidgetHost = {
  widgetState?: unknown;
  setWidgetState?: (state: unknown) => void;
};

declare global {
  interface Window {
    openai?: OpenAIWidgetHost;
  }
}

export function hasOpenAIWidgetHost() {
  return typeof window !== "undefined" && Boolean(window.openai);
}

export function readOpenAIWidgetState<T>() {
  if (typeof window === "undefined") return null;
  return (window.openai?.widgetState ?? null) as T | null;
}

export function writeOpenAIWidgetState<T>(state: T) {
  if (typeof window === "undefined") return;
  if (typeof window.openai?.setWidgetState === "function") {
    window.openai.setWidgetState(state);
  }
}

