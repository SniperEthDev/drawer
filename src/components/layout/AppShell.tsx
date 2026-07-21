import React from "react";
import { Outlet } from "react-router-dom";
import { DesktopSidebar } from "../navigation/DesktopSidebar";
import { BottomNavigation } from "../navigation/BottomNavigation";
import { AppHeader } from "./AppHeader";
import { ErrorBoundary } from "../feedback/ErrorBoundary";

export const AppShell: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col md:flex-row bg-app-background text-text-primary">
        {/* Desktop Sidebar */}
        <DesktopSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <AppHeader />

          {/* Subview Outlet */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
            <Outlet />
          </main>
        </div>

        {/* Mobile Navigation bar */}
        <BottomNavigation />
      </div>
    </ErrorBoundary>
  );
};
export default AppShell;
