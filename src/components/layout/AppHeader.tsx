import React from "react";
import { useGameStore } from "../../store/useGameStore";
import { Volume2, VolumeX, Eye, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { useNavigate, useLocation } from "react-router-dom";

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useGameStore((state) => state.session);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const discardSession = useGameStore((state) => state.discardSession);

  const toggleSound = () => {
    if (session) {
      updateSettings({ soundsEnabled: !session.settings.soundsEnabled });
    }
  };

  const openPresenter = () => {
    window.open("/presenter", "BULLTECH Presenter", "width=1200,height=800");
  };

  const handleGenerateSorteo = async () => {
    if (session && session.status !== "SETUP" && session.status !== "FINISHED") {
      const confirmDiscard = window.confirm(
        "¿Estás seguro de que deseas iniciar un nuevo sorteo? Esto descartará la partida actual en curso."
      );
      if (!confirmDiscard) return;
    }
    await discardSession();
    navigate("/");
  };

  return (
    <header className="bg-panel-glass backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <img src="/brand/logo-bulltech-white.webp" alt="BT" className="w-7 h-7 md:hidden object-contain" />
        <h2 className="text-base font-bold font-tech text-text-primary tracking-wide md:hidden">SORTEADOR</h2>
        <span className="hidden md:inline-block text-xs font-medium text-text-muted">
          {session ? `Evento: ${session.eventName}` : "Esperando configuración"}
        </span>
      </div>

      {/* Mobile only GENERAR SORTEO */}
      {location.pathname !== "/" && (
        <button 
          onClick={handleGenerateSorteo}
          className="md:hidden px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-tech font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-[0_0_10px_rgba(34,197,94,0.3)] border border-green-400"
        >
          <Plus className="w-3 h-3" /> Generar
        </button>
      )}

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
