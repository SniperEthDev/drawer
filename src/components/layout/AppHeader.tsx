import React from "react";
import { useGameStore } from "../../store/useGameStore";
import { Volume2, VolumeX, Eye } from "lucide-react";
import { cn } from "../../lib/cn";

export const AppHeader: React.FC = () => {
  const session = useGameStore((state) => state.session);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const toggleSound = () => {
    if (session) {
      updateSettings({ soundsEnabled: !session.settings.soundsEnabled });
    }
  };

  const openPresenter = () => {
    window.open("/presenter", "BULLTECH Presenter", "width=1200,height=800");
  };

  return (
    <header className="bg-panel-glass backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <img src="/brand/bulltech-drawer-logo.svg" alt="BT" className="w-7 h-7 md:hidden" />
        <h2 className="text-base font-bold font-tech text-text-primary tracking-wide md:hidden">BULLTECH</h2>
        <span className="hidden md:inline-block text-xs font-medium text-text-muted">
          {session ? `Evento: ${session.eventName}` : "Esperando configuración"}
        </span>
      </div>

      {/* Operator controls header */}
      {session && (
        <div className="flex items-center gap-2">
          {session.status !== "SETUP" && (
            <button
              onClick={openPresenter}
              className="p-2 bg-panel-elevated hover:bg-primary/20 text-text-secondary hover:text-text-primary rounded-lg border border-border transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Abrir Pantalla de Presentación"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Presentador</span>
            </button>
          )}

          <button
            onClick={toggleSound}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              session.settings.soundsEnabled
                ? "bg-panel-elevated hover:bg-primary/20 text-primary border-primary/30"
                : "bg-panel-elevated hover:bg-danger/20 text-danger border-danger/30"
            )}
            title={session.settings.soundsEnabled ? "Silenciar sonidos" : "Activar sonidos"}
          >
            {session.settings.soundsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      )}
    </header>
  );
};
export default AppHeader;
