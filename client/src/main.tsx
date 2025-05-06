import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// The favicon and social share images are in the public directory

createRoot(document.getElementById("root")!).render(<App />);
