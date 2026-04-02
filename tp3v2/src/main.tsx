import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import { AuthProvider} from "./features/auth/authContext";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {" "}
    <AuthProvider>
      {" "}
      <App />{" "}
    </AuthProvider>{" "}
  </StrictMode>,
);

import { BrowserRouter } from "react-router-dom";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {" "}
    <BrowserRouter>
      {" "}
      <AuthProvider>
        {" "}
        <App />{" "}
      </AuthProvider>{" "}
    </BrowserRouter>{" "}
  </StrictMode>,
);
