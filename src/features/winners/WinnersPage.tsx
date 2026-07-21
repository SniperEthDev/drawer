import React, { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { Trophy, Clock, Trash2 } from "lucide-react";
import { db } from "../../db/database";
import { cn } from "../../lib/cn";

export const WinnersPage: React.FC = () => {
  const session = useGameStore((state) => state.session);
  const [filter, setFilter] = useState<"ALL" | "LINE" | "BINGO">("ALL");

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary text-sm">No hay ninguna partida activa actualmente.</p>
      </div>
    );
  }

  const filteredWinners = session.winners.filter((w) => {
    if (filter === "ALL") return true;
    return w.type === filter;
  });

  const handleDeleteWinner = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este registro de ganador?")) return;
    
    // Remove from IndexDB
    await db.winners.delete(id);

    // Update Zustand store session
    const updatedWinners = session.winners.filter((w) => w.id !== id);
    const updatedSession = {
      ...session,
      winners: updatedWinners,
      updatedAt: new Date().toISOString()
    };
    await db.sessions.put(updatedSession);
    useGameStore.setState({ session: updatedSession });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-tech text-text-primary">GANADORES DE LA PARTIDA</h1>
          <p className="text-text-secondary text-xs">Registro y validación de premios otorgados en la sesión actual.</p>
        </div>

        {/* Filters */}
        <div className="flex bg-panel border border-border p-1 rounded-xl">
          {(["ALL", "LINE", "BINGO"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold font-tech transition-colors",
                filter === t
                  ? "bg-primary text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {t === "ALL" ? "TODOS" : t === "LINE" ? "LÍNEAS" : "BINGOS"}
            </button>
          ))}
        </div>
      </div>

      {filteredWinners.length === 0 ? (
        <div className="text-center py-16 bg-panel rounded-2xl border border-border">
          <Trophy className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary text-sm font-semibold">Ningún ganador registrado en esta categoría.</p>
          <p className="text-text-muted text-xs mt-1">Usa los botones de reclamación en la consola del operador.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWinners.map((winner) => (
            <div key={winner.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-border-subtle relative group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-tech font-bold px-2 py-1 rounded-lg",
                      winner.type === "BINGO" ? "bg-success/15 text-success border border-success/35" : "bg-primary/15 text-primary border border-primary/35"
                    )}>
                      {winner.type === "BINGO" ? "BINGO" : "LÍNEA"}
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(winner.registeredAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteWinner(winner.id)}
                    className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-text-primary">{winner.name}</h3>
                  {(winner.cardSeries || winner.cardSerial) && (
                    <span className="text-xs text-text-secondary font-tech block mt-0.5">
                      Cartón: {winner.cardSeries || "-"}{winner.cardSerial ? ` / Serial ${winner.cardSerial}` : ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-text-secondary">Bola Ganadora:</span>
                <span className="font-tech font-bold text-primary-light bg-primary/5 px-2 py-1 rounded border border-primary/20">
                  {winner.winningBallLetter} {winner.winningBallNumber}
                </span>
              </div>

              {winner.notes && (
                <div className="mt-3 p-2 bg-app-background-soft border border-border rounded-lg text-[11px] text-text-secondary">
                  <strong>Notas:</strong> {winner.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default WinnersPage;
