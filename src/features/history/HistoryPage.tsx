import React, { useEffect, useState } from "react";
import { db } from "../../db/database";
import { GameSession, AuditEvent } from "../../domain/bingo/types";
import { useLiveQuery } from "dexie-react-hooks";
import { useGameStore } from "../../store/useGameStore";
import { History, Eye, Download, Trash2, Calendar, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "../../components/feedback/ToastProvider";

export const HistoryPage: React.FC = () => {
  const { showToast } = useToast();
  const activeSession = useGameStore((state) => state.session);
  const recoverSession = useGameStore((state) => state.recoverSession);

  // Live Query past sessions from IndexDB
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    if (selectedSessionId) {
      db.auditEvents
        .where("sessionId")
        .equals(selectedSessionId)
        .sortBy("sequence")
        .then(setAuditEvents);
    } else {
      setAuditEvents([]);
    }
  }, [selectedSessionId]);

  const handleRecover = async (id: string) => {
    if (activeSession && activeSession.id !== id && activeSession.status !== "FINISHED") {
      if (!confirm("Hay una partida activa en curso. Si continúas, la descartarás y recuperarás esta partida. ¿Deseas continuar?")) {
        return;
      }
    }
    await recoverSession(id);
    showToast("Partida recuperada con éxito", "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar permanentemente esta partida y todo su historial de auditoría?")) return;
    
    await db.transaction("rw", [db.sessions, db.auditEvents, db.winners], async () => {
      await db.sessions.delete(id);
      await db.auditEvents.where("sessionId").equals(id).delete();
      await db.winners.where("sessionId").equals(id).delete();
    });

    if (activeSession?.id === id) {
      useGameStore.setState({ session: null });
    }
    showToast("Partida eliminada correctamente", "info");
  };

  const handleExportJSON = (session: GameSession) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bulltech-session-${session.id.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-tech text-text-primary">HISTORIAL DE PARTIDAS</h1>
        <p className="text-text-secondary text-xs">Consulta partidas anteriores, auditorías de extracción y exporta resultados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sessions List (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-16 bg-panel rounded-2xl border border-border">
              <History className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary text-sm font-semibold">No se encontraron partidas en el historial.</p>
            </div>
          ) : (
            sessions.map((sess) => {
              const formattedDate = format(new Date(sess.createdAt), "d 'de' MMMM, yyyy · HH:mm", { locale: es });
              const isSelected = selectedSessionId === sess.id;
              
              return (
                <div
                  key={sess.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-primary/5 border-primary"
                      : "bg-panel border-border/80 hover:bg-panel-elevated"
                  }`}
                  onClick={() => setSelectedSessionId(sess.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-tech">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </span>
                      <h3 className="text-base font-bold text-text-primary uppercase">{sess.eventName}</h3>
                      <span className="text-xs text-text-secondary">Operador: {sess.operatorName}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold ${
                      sess.status === "FINISHED" ? "bg-text-muted/15 text-text-secondary" : "bg-success/15 text-success animate-pulse"
                    }`}>
                      {sess.status === "FINISHED" ? "FINALIZADA" : "ACTIVA / PAUSADA"}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-3 text-xs">
                    <div className="flex gap-4">
                      <span>Bolas: <strong>{sess.calledBalls.filter(b => b.status === "VALID").length}</strong></span>
                      <span>Ganadores: <strong>{sess.winners.length}</strong></span>
                    </div>

                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {sess.status !== "FINISHED" && (
                        <button
                          onClick={() => handleRecover(sess.id)}
                          className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-md font-semibold text-[10px] transition-colors"
                        >
                          Recuperar
                        </button>
                      )}
                      <button
                        onClick={() => handleExportJSON(sess)}
                        className="p-1.5 bg-panel-elevated hover:bg-panel border border-border rounded-md text-text-secondary hover:text-text-primary transition-colors"
                        title="Exportar JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sess.id)}
                        className="p-1.5 bg-panel-elevated hover:bg-danger/10 border border-border hover:border-danger/30 rounded-md text-text-secondary hover:text-danger transition-colors"
                        title="Eliminar Partida"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Live Audit Timeline (lg:col-span-5) */}
        <div className="lg:col-span-5">
          {selectedSessionId ? (
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold font-tech text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <ClipboardList className="w-4 h-4 text-primary" /> AUDITORÍA DE PARTIDA
              </h3>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {auditEvents.map((evt) => (
                  <div key={evt.id} className="text-xs flex gap-3 pb-3 border-b border-border-subtle last:border-0 last:pb-0">
                    <span className="text-text-muted font-tech shrink-0">
                      {format(new Date(evt.createdAt), "HH:mm:ss")}
                    </span>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-text-primary block font-tech text-[10px]">
                        {evt.type}
                      </span>
                      <span className="text-text-secondary text-[10px] block">
                        {evt.type === "BALL_DRAWN" && `Extracción de bola ${(evt.payload.ball as any).letter}${(evt.payload.ball as any).number}`}
                        {evt.type === "BALL_REVOKED" && `Anulación de bola ${(evt.payload.ball as any).letter}${(evt.payload.ball as any).number}. Motivo: ${evt.payload.reason}`}
                        {evt.type === "WINNER_REGISTERED" && `Ganador registrado: ${(evt.payload.winner as any).name} (${(evt.payload.winner as any).type})`}
                        {evt.type === "SESSION_CREATED" && "Creación del tablero e inicio de sesión"}
                        {evt.type === "GAME_PAUSED" && `Sorteo pausado: ${evt.payload.reason}`}
                        {evt.type === "GAME_RESUMED" && "Sorteo reanudado por operador"}
                        {evt.type === "SESSION_FINISHED" && "Partida finalizada formalmente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[250px] border border-dashed border-border rounded-2xl flex items-center justify-center text-center p-6 text-text-muted text-xs font-tech">
              SELECCIONA UNA PARTIDA PARA VER EL REGISTRO DE AUDITORÍA
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default HistoryPage;
