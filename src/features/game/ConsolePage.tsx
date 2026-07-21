import React, { useEffect, useState, useRef } from "react";
import { useGameStore } from "../../store/useGameStore";
import { useNavigate } from "react-router-dom";
import { Play, Pause, RotateCw, Trophy, FileSpreadsheet, Eye, ShieldAlert, Monitor, Volume2, Search, X } from "lucide-react";
import { BallSphere } from "../../components/ui/BallSphere";
import { CountdownRing } from "../../components/ui/CountdownRing";
import { AutoDrawScheduler } from "../../services/scheduler/AutoDrawScheduler";
import { getBingoLetter } from "../../domain/bingo/ballOrder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/Dialog";
import { useToast } from "../../components/feedback/ToastProvider";
import { cn } from "../../lib/cn";

export const ConsolePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = useGameStore((state) => state.session);
  const startSession = useGameStore((state) => state.startSession);
  const drawNextBall = useGameStore((state) => state.drawNextBall);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const revokeLastBall = useGameStore((state) => state.revokeLastBall);
  const announceCurrentBall = useGameStore((state) => state.announceCurrentBall);
  const registerWinner = useGameStore((state) => state.registerWinner);
  const finishSession = useGameStore((state) => state.finishSession);
  const updateSettings = useGameStore((state) => state.updateSettings);

  // Operator UI states
  const [boardSearch, setBoardSearch] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  
  // Custom timer display
  const [remainingTime, setRemainingTime] = useState(0);

  // Dialog states
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [bingoModalOpen, setBingoModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  
  // Dialog Inputs
  const [winnerName, setWinnerName] = useState("");
  const [cardSeries, setCardSeries] = useState("");
  const [cardSerial, setCardSerial] = useState("");
  const [winnerNotes, setWinnerNotes] = useState("");
  const [revokeReason, setRevokeReason] = useState("");

  // Revoke button hold interaction
  const [isHoldingRevoke, setIsHoldingRevoke] = useState(false);
  const holdTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!session) {
      navigate("/");
    }
  }, [session, navigate]);

  // Handle active countdown polling
  useEffect(() => {
    if (!session || session.status !== "WAITING_AUTO") {
      setRemainingTime(0);
      return;
    }
    const interval = setInterval(() => {
      setRemainingTime(AutoDrawScheduler.getRemainingTime());
    }, 100);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  const validCalledBalls = session.calledBalls.filter((b) => b.status === "VALID");
  const lastBall = validCalledBalls[validCalledBalls.length - 1];

  const handleStart = async () => {
    try {
      await startSession();
      showToast("Partida iniciada", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDraw = async () => {
    try {
      await drawNextBall();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSearchBall = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(boardSearch, 10);
    if (isNaN(num) || num < 1 || num > 75) {
      setSearchResult("Número no válido (debe ser del 1 al 75)");
      return;
    }
    
    const found = session.calledBalls.find((b) => b.number === num);
    if (!found) {
      setSearchResult(`El número ${num} aún no ha sido extraído.`);
    } else if (found.status === "REVOKED") {
      setSearchResult(`El número ${num} fue extraído en la secuencia #${found.sequence} pero fue anulado. Motivo: ${found.revocationReason}`);
    } else {
      setSearchResult(`El número ${num} ya salió en la secuencia #${found.sequence} a las ${new Date(found.calledAt).toLocaleTimeString()}.`);
    }
  };

  // Revoke long-press interactions
  const startRevokeHold = () => {
    setIsHoldingRevoke(true);
    holdTimerRef.current = setTimeout(() => {
      setIsHoldingRevoke(false);
      setRevokeModalOpen(true);
    }, 1500); // 1.5 second hold
  };

  const endRevokeHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHoldingRevoke(false);
  };

  const handleConfirmRevoke = async () => {
    if (!revokeReason.trim()) {
      showToast("El motivo de anulación es obligatorio.", "warning");
      return;
    }
    if (lastBall) {
      await revokeLastBall(revokeReason);
      setRevokeReason("");
      setRevokeModalOpen(false);
      showToast(`Bola ${lastBall.letter}${lastBall.number} anulada con éxito`, "success");
    }
  };

  const handleRegisterWinner = async (type: "LINE" | "BINGO") => {
    if (!winnerName.trim()) {
      showToast("El nombre del ganador es obligatorio.", "warning");
      return;
    }
    if (!lastBall) {
      showToast("No se puede registrar ganador si no se ha extraído ninguna bola.", "error");
      return;
    }

    // Force pause first
    await pauseGame("Reclamación de premio");

    await registerWinner({
      type,
      name: winnerName,
      cardSeries: cardSeries.trim() || undefined,
      cardSerial: cardSerial.trim() || undefined,
      winningBallNumber: lastBall.number,
      winningBallLetter: lastBall.letter,
      verificationStatus: "MANUAL",
      notes: winnerNotes.trim() || undefined
    });

    setWinnerName("");
    setCardSeries("");
    setCardSerial("");
    setWinnerNotes("");
    
    if (type === "LINE") {
      setLineModalOpen(false);
    } else {
      setBingoModalOpen(false);
      // Ask to finalize session on Bingo
      if (confirm("¿Deseas finalizar la partida actual al otorgar este Bingo?")) {
        await finishSession();
        navigate("/history");
      }
    }
    showToast("Ganador registrado correctamente", "success");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Controls, stats, voice options (lg:col-span-4) */}
      <div className="lg:col-span-4 space-y-6">
        {/* State Panel */}
        <section className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">ESTADO DE PARTIDA</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-tech font-bold ${
              session.status === "READY" ? "bg-success/15 text-success" :
              session.status === "DRAWING" || session.status === "ANNOUNCING" ? "bg-primary/15 text-primary" :
              session.status === "PAUSED" ? "bg-warning/15 text-warning" :
              session.status === "WAITING_AUTO" ? "bg-info/15 text-info animate-pulse" :
              "bg-text-muted/15 text-text-secondary"
            }`}>
              {session.status}
            </span>
          </div>

          {session.status === "SETUP" && (
            <button
              onClick={handleStart}
              className="w-full py-3 bg-primary text-text-primary rounded-xl font-bold font-tech text-xs tracking-wider neon-glow hover:bg-primary-strong transition-colors"
            >
              COMENZAR PARTIDA
            </button>
          )}

          {session.status !== "SETUP" && session.status !== "FINISHED" && (
            <div className="space-y-3">
              {/* PRIMARY ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-3">
                {session.status === "PAUSED" ? (
                  <button
                    onClick={resumeGame}
                    className="col-span-2 py-3.5 bg-success text-text-primary rounded-xl font-bold font-tech text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-success/90 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" /> CONTINUAR
                  </button>
                ) : (
                  <button
                    onClick={() => pauseGame("Pausa del operador")}
                    className="col-span-2 py-3.5 bg-warning text-text-primary rounded-xl font-bold font-tech text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-warning/90 transition-colors"
                  >
                    <Pause className="w-4 h-4" /> PAUSAR
                  </button>
                )}

                {/* DRAW BALL */}
                <button
                  disabled={session.status === "DRAWING" || session.status === "ANNOUNCING" || session.status === "PAUSED" || session.currentIndex >= 75}
                  onClick={handleDraw}
                  className="col-span-2 py-4 bg-primary disabled:opacity-50 text-text-primary rounded-xl font-bold font-tech text-sm tracking-wider flex items-center justify-center gap-2 neon-glow hover:bg-primary-strong transition-all duration-200"
                >
                  <RotateCw className="w-5 h-5 animate-spin-slow" /> EXTRAER SIGUIENTE BOLA
                </button>
              </div>

              {/* AUTOMATIC MODE COUNTDOWN DISPLAY */}
              {session.status === "WAITING_AUTO" && (
                <div className="flex flex-col items-center justify-center p-3 bg-primary/5 rounded-xl border border-primary/20">
                  <CountdownRing remaining={remainingTime} total={session.settings.automaticDelaySeconds} size={70} />
                  <span className="text-[10px] text-text-secondary mt-2">Próxima extracción automática</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Voice repetition */}
          {lastBall && (
            <button
              onClick={announceCurrentBall}
              className="w-full py-2 bg-panel-elevated hover:bg-panel hover:text-primary text-text-secondary border border-border rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Volume2 className="w-4 h-4" /> Repetir Último Anuncio
            </button>
          )}
        </section>

        {/* Game Stats */}
        <section className="glass-panel p-6 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold font-tech text-text-primary tracking-wide border-b border-border pb-1.5">ESTADÍSTICAS</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-text-secondary block">Extraídas</span>
              <span className="font-tech font-bold text-lg text-text-primary">{validCalledBalls.length} / 75</span>
            </div>
            <div>
              <span className="text-text-secondary block">Pendientes</span>
              <span className="font-tech font-bold text-lg text-text-primary">{75 - validCalledBalls.length}</span>
            </div>
            <div>
              <span className="text-text-secondary block">Líneas Otorgadas</span>
              <span className="font-tech font-bold text-lg text-text-primary">{session.winners.filter(w => w.type === "LINE").length}</span>
            </div>
            <div>
              <span className="text-text-secondary block">Bingos</span>
              <span className="font-tech font-bold text-lg text-text-primary">{session.winners.filter(w => w.type === "BINGO").length}</span>
            </div>
          </div>
        </section>
      </div>

      {/* CENTER COLUMN: Main Ball sphere and Claim controls (lg:col-span-5) */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
        {lastBall ? (
          <div className="text-center space-y-4 w-full flex flex-col items-center">
            {/* Main Ball Display */}
            <BallSphere letter={lastBall.letter} number={lastBall.number} isDrawing={session.status === "DRAWING"} />
            
            <div className="space-y-0.5">
              <span className="text-[10px] text-primary font-tech tracking-widest block uppercase">BOLA EXTRAÍDA</span>
            </div>

            {/* INTERACTIVE SLIDER: Last 5 Shuffled/Drawn Balls */}
            <div className="w-full max-w-sm glass-panel p-2.5 rounded-xl border border-border/80">
              <span className="text-[8px] font-tech text-text-secondary tracking-widest block text-center uppercase mb-1.5">ÚLTIMAS EXTRAÍDAS</span>
              <div className="flex justify-center items-center gap-3 overflow-x-auto py-0.5 scrollbar-none">
                {validCalledBalls.slice(-5).reverse().map((ball, idx) => {
                  let badgeColor = "border-primary text-primary-light bg-primary/10";
                  if (ball.letter === "B") badgeColor = "border-cyan-400 text-cyan-400 bg-cyan-950/40";
                  else if (ball.letter === "I") badgeColor = "border-orange-500 text-orange-500 bg-orange-950/40";
                  else if (ball.letter === "N") badgeColor = "border-yellow-400 text-yellow-400 bg-yellow-950/40";
                  else if (ball.letter === "G") badgeColor = "border-emerald-500 text-emerald-500 bg-emerald-950/40";
                  else if (ball.letter === "O") badgeColor = "border-pink-500 text-pink-500 bg-pink-950/40";

                  const isLatest = idx === 0;

                  return (
                    <div
                      key={ball.id}
                      className={cn(
                        "w-12 h-12 rounded-full border flex flex-col items-center justify-center shrink-0 font-tech shadow-md transition-all duration-300",
                        badgeColor,
                        isLatest ? "scale-110 ring-2 ring-white/20 font-bold" : "opacity-80 scale-95"
                      )}
                    >
                      <span className="text-[10px] leading-none opacity-85">{ball.letter}</span>
                      <span className="text-sm leading-none font-bold mt-0.5">{ball.number}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-52 h-52 rounded-full border-4 border-dashed border-border flex items-center justify-center text-center p-6 text-text-muted text-sm font-tech">
            PARTIDA LISTA. EXTRAE LA PRIMERA BOLA.
          </div>
        )}

        {/* CLAIM CONTROLS */}
        {session.status !== "SETUP" && (
          <section className="glass-panel p-6 rounded-2xl w-full space-y-4">
            <h3 className="text-sm font-bold font-tech text-text-primary text-center">RECLAMACIONES DE PREMIOS</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLineModalOpen(true)}
                className="py-3 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-xl font-bold font-tech text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200"
              >
                <Trophy className="w-4 h-4" /> RECLAMAR LÍNEA
              </button>
              <button
                onClick={() => setBingoModalOpen(true)}
                className="py-3 bg-success/10 border border-success/20 hover:bg-success/20 text-success rounded-xl font-bold font-tech text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200"
              >
                <Trophy className="w-4 h-4" /> RECLAMAR BINGO
              </button>

              {/* ANULACIÓN (Hold to Trigger) */}
              {lastBall && (
                <button
                  onMouseDown={startRevokeHold}
                  onMouseUp={endRevokeHold}
                  onMouseLeave={endRevokeHold}
                  onTouchStart={startRevokeHold}
                  onTouchEnd={endRevokeHold}
                  className={`col-span-2 py-3 bg-danger/10 border border-danger/20 text-danger rounded-xl font-bold font-tech text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 select-none ${
                    isHoldingRevoke ? "bg-danger/30 scale-95" : "hover:bg-danger/20"
                  }`}
                >
                  <X className="w-4 h-4" /> {isHoldingRevoke ? "Mantenlo pulsado..." : "ANULAR ÚLTIMA BOLA (Mantener)"}
                </button>
              )}
            </div>
          </section>
        )}
      </div>

      {/* RIGHT COLUMN: Full board and Search tool (lg:col-span-3) */}
      <div className="lg:col-span-3 space-y-6">
        {/* Full 75-Ball Board */}
        <section className="glass-panel p-4 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold font-tech text-text-primary tracking-wide border-b border-border pb-1.5 text-center">TABLERO 1-75</h3>

          {/* Search box */}
          <form onSubmit={handleSearchBall} className="relative">
            <input
              type="text"
              placeholder="¿Ya salió este número?"
              value={boardSearch}
              onChange={(e) => setBoardSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-8 bg-app-background-soft border border-border rounded-lg text-text-primary text-xs focus:outline-none focus:border-primary"
            />
            <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-2.5" />
            {boardSearch && (
              <button
                type="button"
                onClick={() => {
                  setBoardSearch("");
                  setSearchResult(null);
                }}
                className="absolute right-3 top-2.5 text-text-muted hover:text-text-secondary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {searchResult && (
            <div className="p-3 bg-panel-elevated border border-border rounded-lg text-xs text-text-secondary leading-relaxed">
              {searchResult}
            </div>
          )}

          {/* Tablero Grid Groups */}
          <div className="space-y-3 font-tech text-[10px]">
            {(["B", "I", "N", "G", "O"] as const).map((letter) => {
              const start = letter === "B" ? 1 : letter === "I" ? 16 : letter === "N" ? 31 : letter === "G" ? 46 : 61;
              const range = Array.from({ length: 15 }, (_, i) => start + i);

              return (
                <div key={letter} className="flex items-center gap-2">
                  <span className="w-5 font-bold text-center text-primary-light">{letter}</span>
                  <div className="flex-1 grid grid-cols-5 gap-1">
                    {range.map((num) => {
                      const ballInfo = session.calledBalls.find((b) => b.number === num);
                      const isCalled = ballInfo && ballInfo.status === "VALID";
                      const isRevoked = ballInfo && ballInfo.status === "REVOKED";
                      const isLatest = lastBall && lastBall.number === num;

                      return (
                        <div
                          key={num}
                          className={cn(
                            "aspect-square flex items-center justify-center rounded border text-center transition-all duration-200",
                            isLatest
                              ? "bg-danger border-danger text-white scale-110 font-bold neon-glow-red-strong"
                              : isCalled
                              ? "bg-transparent text-text-primary font-bold neon-glow-red"
                              : isRevoked
                              ? "bg-danger/5 border-danger/10 text-danger/30 line-through"
                              : "bg-app-background-soft border-border/40 text-text-muted"
                          )}
                          title={`${letter}${num}`}
                        >
                          {num}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* DIALOGS AND MODALS */}

      {/* LINE CLAIM MODAL */}
      <Dialog open={lineModalOpen} onOpenChange={setLineModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reclamación de Línea</DialogTitle>
            <DialogDescription>Completa los datos del ganador de la línea.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Nombre del Ganador *</label>
              <input
                type="text"
                required
                value={winnerName}
                onChange={(e) => setWinnerName(e.target.value)}
                className="w-full h-11 px-4 bg-app-background border border-border rounded-xl text-text-primary text-sm focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Serie del Cartón</label>
                <input
                  type="text"
                  value={cardSeries}
                  onChange={(e) => setCardSeries(e.target.value)}
                  className="w-full h-11 px-4 bg-app-background border border-border rounded-xl text-text-primary text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Número de Serial</label>
                <input
                  type="text"
                  value={cardSerial}
                  onChange={(e) => setCardSerial(e.target.value)}
                  className="w-full h-11 px-4 bg-app-background border border-border rounded-xl text-text-primary text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Notas Adicionales</label>
              <textarea
                value={winnerNotes}
                onChange={(e) => setWinnerNotes(e.target.value)}
                className="w-full h-20 p-3 bg-app-background border border-border rounded-xl text-text-primary text-sm focus:outline-none resize-none"
              />
            </div>
            <button
              onClick={() => handleRegisterWinner("LINE")}
              className="w-full py-3 bg-primary text-text-primary rounded-xl font-bold font-tech text-xs tracking-wider hover:bg-primary-strong transition-colors"
            >
              CONFIRMAR GANADOR DE LÍNEA
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* BINGO CLAIM MODAL */}
      <Dialog open={bingoModalOpen} onOpenChange={setBingoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reclamación de BINGO</DialogTitle>
            <DialogDescription>Completa los datos del ganador del Bingo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Nombre del Ganador *</label>
              <input
                type="text"
                required
                value={winnerName}
                onChange={(e) => setWinnerName(e.target.value)}
                className="w-full h-11 px-4 bg-app-background border border-border rounded-xl text-text-primary text-sm focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Serie del Cartón</label>
                <input
                  type="text"
                  value={cardSeries}
                  onChange={(e) => setCardSeries(e.target.value)}
                  className="w-full h-11 px-4 bg-app-background border border-border rounded-xl text-text-primary text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Número de Serial</label>
                <input
                  type="text"
                  value={cardSerial}
                  onChange={(e) => setCardSerial(e.target.value)}
                  className="w-full h-11 px-4 bg-app-background border border-border rounded-xl text-text-primary text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Notas Adicionales</label>
              <textarea
                value={winnerNotes}
                onChange={(e) => setWinnerNotes(e.target.value)}
                className="w-full h-20 p-3 bg-app-background border border-border rounded-xl text-text-primary text-sm focus:outline-none resize-none"
              />
            </div>
            <button
              onClick={() => handleRegisterWinner("BINGO")}
              className="w-full py-3 bg-success text-text-primary rounded-xl font-bold font-tech text-xs tracking-wider hover:bg-success/90 transition-colors"
            >
              CONFIRMAR GANADOR DE BINGO
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* BALL REVOKE CONFIRMATION MODAL */}
      <Dialog open={revokeModalOpen} onOpenChange={setRevokeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-danger flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Anular Última Bola
            </DialogTitle>
            <DialogDescription>
              La bola {lastBall?.letter}{lastBall?.number} permanecerá en el registro de auditoría, pero dejará de considerarse válida para reclamar premios.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Motivo de Anulación *</label>
              <textarea
                required
                placeholder="Ej. Bola extraída por error, desajuste mecánico, etc."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full h-24 p-3 bg-app-background border border-border rounded-xl text-text-primary text-sm focus:outline-none resize-none"
              />
            </div>
            <button
              onClick={handleConfirmRevoke}
              className="w-full py-3 bg-danger text-text-primary rounded-xl font-bold font-tech text-xs tracking-wider hover:bg-danger/90 transition-colors"
            >
              EFECTUAR ANULACIÓN
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default ConsolePage;
