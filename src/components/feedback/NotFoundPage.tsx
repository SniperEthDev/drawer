import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl space-y-5">
        <div className="p-3 bg-danger/10 text-danger rounded-full w-14 h-14 flex items-center justify-center mx-auto neon-glow">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-tech text-text-primary">PÁGINA NO ENCONTRADA</h1>
        <p className="text-text-secondary text-xs leading-relaxed">
          La ruta a la que intentas acceder no existe o ha sido movida. Puedes volver al tablero de control o a la configuración.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 bg-primary hover:bg-primary-strong text-text-primary rounded-xl font-bold font-tech text-xs tracking-wider transition-colors"
        >
          VOLVER AL INICIO
        </Link>
      </div>
    </div>
  );
};
export default NotFoundPage;
