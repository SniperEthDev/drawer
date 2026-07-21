import { create } from "zustand";
import { GameSession, CalledBall, Winner, GameSettings, GameStatus, AuditEvent, BingoLetter } from "../domain/bingo/types";
import { db } from "../db/database";
import { canTransition, canDrawNextBall, canPauseGame, canResumeGame, canRegisterClaim, canFinishGame } from "../domain/game/stateMachine";
import { createSecureBallOrder, getBingoLetter, createOrderCommitment } from "../domain/bingo/ballOrder";
import { SpeechService } from "../services/speech/SpeechService";
import { SoundService } from "../services/audio/SoundService";
import { WakeLockService } from "../services/wakeLock/WakeLockService";
import { AutoDrawScheduler } from "../services/scheduler/AutoDrawScheduler";

// Sync sync channel for present/operator
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined") {
  syncChannel = new BroadcastChannel("bulltech-drawer-session-v1");
}

export interface GameState {
  session: GameSession | null;
  activeTimerCountdown: number;
  isPresenter: boolean;
  operatorLockActive: boolean;
  
  // Actions
  initNewSession: (settings: GameSettings) => Promise<string>;
  startSession: () => Promise<void>;
  drawNextBall: () => Promise<void>;
  announceCurrentBall: () => Promise<void>;
  pauseGame: (reason?: string) => Promise<void>;
  resumeGame: () => Promise<void>;
  revokeLastBall: (reason: string) => Promise<void>;
  registerWinner: (winner: Omit<Winner, "id" | "sessionId" | "registeredAt">) => Promise<void>;
  finishSession: () => Promise<void>;
  recoverSession: (sessionId: string) => Promise<void>;
  discardSession: () => Promise<void>;
  updateSettings: (settings: Partial<GameSettings>) => Promise<void>;
  setPresenterMode: (val: boolean) => void;
  syncSessionSnapshot: (session: GameSession) => void;
}

export const useGameStore = create<GameState>((set, get) => {
  
  const broadcastSnapshot = (session: GameSession) => {
    if (syncChannel) {
      syncChannel.postMessage({
        version: 1,
        type: "SESSION_SNAPSHOT",
        payload: session
      });
    }
  };

  const createAuditEvent = async (
    sessionId: string,
    type: AuditEvent["type"],
    payload: Record<string, unknown>
  ): Promise<AuditEvent> => {
    const sequence = await db.auditEvents.where("sessionId").equals(sessionId).count() + 1;
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      sessionId,
      sequence,
      type,
      createdAt: new Date().toISOString(),
      payload
    };
    await db.auditEvents.put(event);
    return event;
  };

  return {
    session: null,
    activeTimerCountdown: 0,
    isPresenter: false,
    operatorLockActive: false,

    setPresenterMode: (val: boolean) => {
      set({ isPresenter: val });
    },

    syncSessionSnapshot: (session: GameSession) => {
      set({ session });
    },

    initNewSession: async (settings: GameSettings) => {
      const sessionId = crypto.randomUUID();
      const nonce = crypto.randomUUID();
      const shuffledBalls = createSecureBallOrder();
      const commitment = await createOrderCommitment(sessionId, nonce, shuffledBalls);

      const session: GameSession = {
        schemaVersion: 1,
        id: sessionId,
        eventName: settings.eventName,
        operatorName: settings.operatorName,
        roomName: settings.roomName,
        status: "SETUP",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shuffledBalls,
        currentIndex: 0,
        calledBalls: [],
        winners: [],
        settings,
        orderCommitment: commitment,
        auditNonce: nonce
      };

      await db.sessions.put(session);
      await createAuditEvent(sessionId, "SESSION_CREATED", { settings });
      set({ session });
      broadcastSnapshot(session);
      return sessionId;
    },

    startSession: async () => {
      const { session } = get();
      if (!session || !canTransition(session.status, "READY")) {
        throw new Error("Transición de estado inválida: READY");
      }

      const updated = {
        ...session,
        status: "READY" as const,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.sessions.put(updated);
      await createAuditEvent(session.id, "SESSION_STARTED", {});
      
      if (updated.settings.wakeLockEnabled) {
        await WakeLockService.request();
      }

      set({ session: updated });
      broadcastSnapshot(updated);
    },

    drawNextBall: async () => {
      const { session } = get();
      if (!session || !canDrawNextBall(session)) {
        throw new Error("No se puede extraer la siguiente bola en el estado actual.");
      }

      // Transition to DRAWING
      const nextIndex = session.currentIndex + 1;
      const num = session.shuffledBalls[session.currentIndex];
      const letter = getBingoLetter(num);

      const newBall: CalledBall = {
        id: crypto.randomUUID(),
        number: num,
        letter,
        sequence: nextIndex,
        calledAt: new Date().toISOString(),
        status: "VALID",
        voiceText: `${letter}, ${num}`
      };

      const updatedDrawing = {
        ...session,
        status: "DRAWING" as const,
        calledBalls: [...session.calledBalls, newBall],
        currentIndex: nextIndex,
        updatedAt: new Date().toISOString()
      };

      set({ session: updatedDrawing });
      broadcastSnapshot(updatedDrawing);

      // Play Sound
      if (session.settings.soundsEnabled) {
        SoundService.playNewBall();
      }
      if (session.settings.vibrationEnabled) {
        SoundService.triggerVibration(100);
      }

      await createAuditEvent(session.id, "BALL_DRAWN", { ball: newBall });

      // Auto Transition to ANNOUNCING
      const updatedAnnouncing = {
        ...updatedDrawing,
        status: "ANNOUNCING" as const
      };
      set({ session: updatedAnnouncing });
      broadcastSnapshot(updatedAnnouncing);

      // Trigger TTS Voice announcement
      if (session.settings.voiceEnabled) {
        await SpeechService.announceBall(
          letter,
          num,
          {
            rate: session.settings.voiceRate,
            pitch: session.settings.voicePitch,
            volume: session.settings.voiceVolume
          }
        );
      }

      await createAuditEvent(session.id, "BALL_ANNOUNCED", { number: num, letter });

      // Determine next status based on DrawMode
      let finalStatus: GameStatus = "READY";
      if (session.settings.mode === "AUTOMATIC") {
        finalStatus = "WAITING_AUTO";
      } else if (session.settings.mode === "SEMI_AUTOMATIC") {
        finalStatus = "READY";
      }

      const updatedFinal = {
        ...updatedAnnouncing,
        status: finalStatus,
        updatedAt: new Date().toISOString()
      };

      await db.sessions.put(updatedFinal);
      set({ session: updatedFinal });
      broadcastSnapshot(updatedFinal);

      // If AUTOMATIC, schedule next draw
      if (session.settings.mode === "AUTOMATIC") {
        AutoDrawScheduler.start(session.settings.automaticDelaySeconds, () => {
          get().drawNextBall();
        });
      }
    },

    announceCurrentBall: async () => {
      const { session } = get();
      if (!session || session.calledBalls.length === 0) return;
      const lastBall = session.calledBalls[session.calledBalls.length - 1];
      if (lastBall.status === "VALID" && session.settings.voiceEnabled) {
        await SpeechService.announceBall(
          lastBall.letter,
          lastBall.number,
          {
            rate: session.settings.voiceRate,
            pitch: session.settings.voicePitch,
            volume: session.settings.voiceVolume
          }
        );
      }
    },

    pauseGame: async (reason?: string) => {
      const { session } = get();
      if (!session || !canPauseGame(session)) return;

      AutoDrawScheduler.pause();
      
      const updated = {
        ...session,
        status: "PAUSED" as const,
        updatedAt: new Date().toISOString()
      };

      await db.sessions.put(updated);
      await createAuditEvent(session.id, "GAME_PAUSED", { reason: reason || "Manual Pause" });
      
      if (session.settings.soundsEnabled) {
        SoundService.playPause();
      }

      set({ session: updated });
      broadcastSnapshot(updated);
    },

    resumeGame: async () => {
      const { session } = get();
      if (!session || !canResumeGame(session)) return;

      if (session.settings.soundsEnabled) {
        SoundService.playResume();
      }

      let nextStatus: GameStatus = "READY";
      if (session.settings.mode === "AUTOMATIC") {
        nextStatus = "WAITING_AUTO";
      }

      const updated = {
        ...session,
        status: nextStatus,
        updatedAt: new Date().toISOString()
      };

      await db.sessions.put(updated);
      await createAuditEvent(session.id, "GAME_RESUMED", {});
      
      set({ session: updated });
      broadcastSnapshot(updated);

      if (session.settings.mode === "AUTOMATIC") {
        AutoDrawScheduler.start(session.settings.automaticDelaySeconds, () => {
          get().drawNextBall();
        });
      }
    },

    revokeLastBall: async (reason: string) => {
      const { session } = get();
      if (!session || session.calledBalls.length === 0) return;

      const lastBall = session.calledBalls[session.calledBalls.length - 1];
      if (lastBall.status !== "VALID") return;

      // Force Pause first
      AutoDrawScheduler.pause();

      const updatedBalls = session.calledBalls.map((b) => {
        if (b.id === lastBall.id) {
          return {
            ...b,
            status: "REVOKED" as const,
            revokedAt: new Date().toISOString(),
            revocationReason: reason
          };
        }
        return b;
      });

      const updated = {
        ...session,
        status: "PAUSED" as const,
        calledBalls: updatedBalls,
        updatedAt: new Date().toISOString()
      };

      await db.sessions.put(updated);
      await createAuditEvent(session.id, "BALL_REVOKED", { ball: lastBall, reason });
      
      if (session.settings.soundsEnabled) {
        SoundService.playError();
      }

      set({ session: updated });
      broadcastSnapshot(updated);
    },

    registerWinner: async (winnerData) => {
      const { session } = get();
      if (!session || !canRegisterClaim(session)) return;

      const winner: Winner = {
        ...winnerData,
        id: crypto.randomUUID(),
        sessionId: session.id,
        registeredAt: new Date().toISOString()
      };

      const updatedWinners = [...session.winners, winner];
      const updated = {
        ...session,
        winners: updatedWinners,
        updatedAt: new Date().toISOString()
      };

      await db.winners.put(winner);
      await db.sessions.put(updated);
      await createAuditEvent(session.id, "WINNER_REGISTERED", { winner });

      if (session.settings.soundsEnabled) {
        if (winner.type === "BINGO") SoundService.playBingoWinner();
        else SoundService.playLineWinner();
      }

      if (session.settings.voiceEnabled && session.settings.winnerVoiceAnnouncement) {
        await SpeechService.announceWinner(
          winner.name,
          winner.type === "BINGO" ? "Bingo" : winner.type === "LINE" ? "Línea" : (winner.customPrizeName || "Premio Especial"),
          winner.winningBallLetter,
          winner.winningBallNumber,
          {
            rate: session.settings.voiceRate,
            pitch: session.settings.voicePitch,
            volume: session.settings.voiceVolume
          }
        );
      }

      set({ session: updated });
      broadcastSnapshot(updated);
    },

    finishSession: async () => {
      const { session } = get();
      if (!session || !canFinishGame(session)) return;

      AutoDrawScheduler.cancel();
      await WakeLockService.release();

      const updated = {
        ...session,
        status: "FINISHED" as const,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.sessions.put(updated);
      await createAuditEvent(session.id, "SESSION_FINISHED", {});
      
      if (session.settings.soundsEnabled) {
        SoundService.playFinished();
      }

      set({ session: updated });
      broadcastSnapshot(updated);
    },

    recoverSession: async (sessionId: string) => {
      const session = await db.sessions.get(sessionId);
      if (!session) return;

      const updated = {
        ...session,
        status: "PAUSED" as const, // Always recover as paused
        updatedAt: new Date().toISOString()
      };

      await db.sessions.put(updated);
      await createAuditEvent(sessionId, "SESSION_RECOVERED", {});

      set({ session: updated });
      broadcastSnapshot(updated);
    },

    discardSession: async () => {
      const { session } = get();
      if (!session) return;

      AutoDrawScheduler.cancel();
      await WakeLockService.release();

      // Delete active session from DB (can keep in history if finished, but setup/discarded sessions are removed)
      await db.sessions.delete(session.id);
      set({ session: null });
    },

    updateSettings: async (newSettings) => {
      const { session } = get();
      if (!session) return;

      const updatedSettings = {
        ...session.settings,
        ...newSettings
      };

      const updated = {
        ...session,
        settings: updatedSettings,
        updatedAt: new Date().toISOString()
      };

      await db.sessions.put(updated);
      await createAuditEvent(session.id, "SETTINGS_CHANGED", { changes: newSettings });

      set({ session: updated });
      broadcastSnapshot(updated);
    }
  };
});

// React synchronization sync loop
if (syncChannel) {
  syncChannel.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SESSION_SNAPSHOT") {
      // Synchronize in presenter screen or operator fallback
      const store = useGameStore;
      if (store.getState().isPresenter) {
        store.getState().syncSessionSnapshot(event.data.payload);
      }
    }
  });
}
