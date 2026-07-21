import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { SetupPage } from "../features/setup/SetupPage";
import { ConsolePage } from "../features/game/ConsolePage";
import { PresenterPage } from "../features/presenter/PresenterPage";
import { WinnersPage } from "../features/winners/WinnersPage";
import { HistoryPage } from "../features/history/HistoryPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { HelpPage } from "../features/help/HelpPage";
import { NotFoundPage } from "../components/feedback/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <SetupPage /> },
      { path: "game", element: <ConsolePage /> },
      { path: "winners", element: <WinnersPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "help", element: <HelpPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  },
  {
    // Presenter is outside AppShell for clean presenter display
    path: "/presenter",
    element: <PresenterPage />
  }
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
export default AppRouter;
