import React from "react";
import { ToastProvider } from "../components/feedback/ToastProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
};
export default AppProviders;
