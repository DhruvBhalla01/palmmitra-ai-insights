import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/posthog";
import { initTheme } from "./lib/theme";

initTheme();

createRoot(document.getElementById("root")!).render(
  <App />
);
