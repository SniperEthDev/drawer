import React, { useEffect } from "react";
import { useGameStore } from "../../store/useGameStore";
import { BallSphere } from "../../components/ui/BallSphere";
import { cn } from "../../lib/cn";

export const PresenterPage: React.FC = () => {
  const session = useGameStore((state) => state.session);
  const setPresenterMode = useGameStore((state) => state.setPresenterMode);

  useEffect(() => {
    setPresenterMode(true);
    return () => setPresenterMode(false);
  }, [setPresenterMode]);

  if (!session) {
    return (
      <div className="min-h-screen bg-app-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl space-y-4">
          <img src="/brand/bulltech-drawer-logo.svg" alt="BT" className="w-16 h-16 mx-auto animate-pulse" />
          <h1 className="text-xl font-bold font-tech text-text-primary">MODO PRESENTADOR</h1>
          <p className="text-text-secondary text-sm">Esperando que se inicie o configure una partida activa...</p>
        </div>
      </div>
    );
  }

  const validCalledBalls = session.calledBalls.filter((b) => b.status === "VALID");
  const lastBall = validCalledBalls[validCalledBalls.length - 1];
  const previousBalls = validCalledBalls.slice(-6, -1).reverse(); // Last 5 balls preceding the current one

  return (
    <div className="min-h-screen bg-app-background text-text-primary p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <img src="/brand/bulltech-drawer-logo.svg" alt="Logo" className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-bold font-tech text-text-primary uppercase tracking-wider">{session.eventName}</h1>
            <span className="text-xs text-primary font-tech tracking-widest uppercase">MODO PRESENTADOR (Solo lectura)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.status === "PAUSED" && (
            <span className="px-3 py-1 bg-warning/10 border border-warning/20 text-warning text-xs font-tech font-bold rounded-lg animate-pulse">
              PAUSADO
            </span>
          )}
          {session.status === "FINISHED" && (
            <span className="px-3 py-1 bg-danger/10 border border-danger/20 text-danger text-xs font-tech font-bold rounded-lg">
              PARTIDA FINALIZADA
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Left (Big Ball & History strip), Right (Bingo Board) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-center">
        {/* Left Area (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-8">
          {lastBall ? (
            <div className="text-center space-y-6">
              <BallSphere letter={lastBall.letter} number={lastBall.number} className="w-64 h-64 sm:w-72 sm:h-72" />
              <div className="space-y-1">
                <span className="text-sm text-primary font-tech tracking-widest block uppercase">BOLA EXTRAÍDA</span>
                <h2 className="text-4xl font-black font-tech text-white uppercase">{lastBall.letter} {lastBall.number}</h2>
                <span className="text-sm text-text-secondary block uppercase">{lastBall.voiceText}</span>
              </div>
            </div>
          ) : (
            <div className="w-64 h-64 rounded-full border-4 border-dashed border-border flex items-center justify-center text-center p-8 text-text-muted text-lg font-tech">
              ESPERANDO SORTEO...
            </div>
          )}

          {/* Previous Balls strip */}
          {previousBalls.length > 0 && (
            <div className="w-full max-w-sm space-y-2">
              <span className="text-[10px] font-tech text-text-secondary tracking-wider block text-center uppercase">ÚLTIMAS BOLAS</span>
              <div className="flex justify-center gap-3">
                {previousBalls.map((b) => (
                  <div
                    key={b.id}
                    className="w-12 h-12 rounded-full bg-panel border border-border flex flex-col items-center justify-center shadow-lg"
                  >
                    <span className="text-[8px] text-primary-light font-tech">{b.letter}</span>
                    <span className="text-sm font-bold font-tech text-text-primary leading-tight">{b.number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Area: Big Bingo Board (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-panel-glass border border-border/80 rounded-2xl p-6 shadow-2xl">
          <div className="space-y-4 font-tech text-xs">
            {(["B", "I", "N", "G", "O"] as const).map((letter) => {
              const start = letter === "B" ? 1 : letter === "I" ? 16 : letter === "N" ? 31 : letter === "G" ? 46 : 61;
              const range = Array.from({ length: 15 }, (_, i) => start + i);

              return (
                <div key={letter} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-extrabold text-center text-primary-light">{letter}</span>
                  <div className="flex-1 grid grid-cols-5 gap-1.5 sm:grid-cols-15 sm:gap-1">
                    {range.map((num) => {
                      const ballInfo = session.calledBalls.find((b) => b.number === num);
                      const isCalled = ballInfo && ballInfo.status === "VALID";
                      const isLatest = lastBall && lastBall.number === num;

                      return (
                        <div
                          key={num}
                          className={cn(
                            "aspect-square flex items-center justify-center rounded-lg border text-center transition-all duration-200",
                            isLatest
                              ? "bg-danger border-danger text-white scale-110 font-bold neon-glow-red-strong"
                              : isCalled
                              ? "bg-transparent text-text-primary font-bold neon-glow-red"
                              : "bg-app-background-soft border-border/40 text-text-muted"
                          )}
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
        </div>
      </div>

      {/* Footer Winners Ticker */}
      {session.winners.length > 0 && (
        <div className="bg-panel-elevated border border-border rounded-xl p-4 mt-4">
          <span className="text-[10px] font-tech text-primary tracking-widest block uppercase mb-2">GANADORES DE LA PARTIDA</span>
          <div className="flex flex-wrap gap-3">
            {session.winners.map((winner) => (
              <div key={winner.id} className="px-3 py-1.5 bg-app-background border border-border rounded-lg text-xs flex items-center gap-2">
                <span className="font-semibold text-text-primary">{winner.name}</span>
                <span className={cn(
                  "text-[9px] font-tech font-bold px-1.5 py-0.5 rounded",
                  winner.type === "BINGO" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
                )}>
                  {winner.type}
                </span>
                <span className="text-text-secondary text-[10px]">con {winner.winningBallLetter}{winner.winningBallNumber}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default PresenterPage;
