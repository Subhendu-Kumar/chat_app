import "./index.css";
import App from "./App.tsx";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
