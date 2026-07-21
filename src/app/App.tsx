import React from "react";
import { AppRouter } from "./router";
import { AppProviders } from "./providers";
import "../assets/styles/index.css";

export const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};
export default App;
