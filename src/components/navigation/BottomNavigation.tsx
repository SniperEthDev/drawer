import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Settings, Play, Trophy, History, HelpCircle } from "lucide-react";
import { cn } from "../../lib/cn";

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: "Sorteo", path: "/game", icon: Play },
    { label: "Ganadores", path: "/winners", icon: Trophy },
    { label: "Historial", path: "/history", icon: History },
    { label: "Ajustes", path: "/settings", icon: Settings },
    { label: "Ayuda", path: "/help", icon: HelpCircle }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-panel-glass backdrop-blur-md border-t border-border/80 px-2 py-1 md:hidden safe-bottom">
      <div className="flex justify-around items-center h-12">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors duration-200",
                isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-0.5", isActive ? "text-primary filter drop-shadow-[0_0_4px_rgba(139,92,246,0.6)]" : "text-text-secondary")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
export default BottomNavigation;
