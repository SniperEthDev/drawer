import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Settings, Play, Trophy, History, HelpCircle, Monitor, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { useGameStore } from "../../store/useGameStore";

export const DesktopSidebar: React.FC = () => {


  const location = useLocation();
  const navigate = useNavigate();
  const session = useGameStore((state) => state.session);
  const discardSession = useGameStore((state) => state.discardSession);

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

  const navItems = [
    { label: "Consola de Sorteo", path: "/game", icon: Play },
    { label: "Ganadores y Premios", path: "/winners", icon: Trophy },
    { label: "Historial de Partidas", path: "/history", icon: History },
    { label: "Ajustes Generales", path: "/settings", icon: Settings },
    { label: "Ayuda y Atajos", path: "/help", icon: HelpCircle }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-panel border-r border-border h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-border flex flex-col items-center gap-2 text-center">
        <img src="/brand/logo-bulltech-white.webp" alt="BULLTECH Logo" className="w-60 h-auto object-contain" />
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-bold tracking-wider font-tech text-text-primary">SORTEADOR BULLTECH</h1>
        </div>
      </div>

      {/* Generar Sorteo Button */}
      <div className="px-4 pt-4">
        <button
          onClick={handleGenerateSorteo}
          className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-tech font-bold transition-all duration-200 shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-green-400 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          GENERAR SORTEO
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-text-secondary hover:bg-panel-elevated hover:text-text-primary"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Extra Action: Presenter Link */}
      <div className="p-4 border-t border-border">
        <Link
          to="/presenter"
          target="_blank"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-panel-elevated border border-border hover:bg-primary/10 hover:border-primary/50 text-text-primary rounded-xl text-xs font-semibold font-tech transition-all duration-200"
        >
          <Monitor className="w-4 h-4" />
          Modo Presentador
        </Link>
      </div>
    </aside>
  );
};
export default DesktopSidebar;
