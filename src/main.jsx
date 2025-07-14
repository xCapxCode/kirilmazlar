import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

// Reset utility'yi global hale getir
import './utils/resetApp';
import './utils/debugInfo';

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
