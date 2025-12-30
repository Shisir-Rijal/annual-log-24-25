import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DataProvider } from "@/context/DataProvider";
import { AudioProvider } from "@/context/AudioProvider";

createRoot(document.getElementById("root")!).render(
  <DataProvider>
    <AudioProvider>
      <App />
    </AudioProvider>
  </DataProvider>
);
