import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";
import App from "./router.tsx";
import { ThemeProvider } from "@/context/ThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider defaultTheme="light" storageKey="xellanix-projection-ui-theme">
            <App />
        </ThemeProvider>
    </StrictMode>,
);
