import { GameStatus } from "../bingo/types";

export function canTransition(current: GameStatus, next: GameStatus): boolean {
  switch (current) {
    case "SETUP":
      return next === "READY" || next === "ERROR";
    case "READY":
      return (
        next === "DRAWING" ||
        next === "PAUSED" ||
        next === "CLAIMING" ||
        next === "FINISHED" ||
        next === "ERROR"
      );
    case "DRAWING":
      return next === "ANNOUNCING" || next === "PAUSED" || next === "ERROR";
    case "ANNOUNCING":
      return (
        next === "READY" ||
        next === "WAITING_AUTO" ||
        next === "PAUSED" ||
        next === "ERROR"
      );
    case "WAITING_AUTO":
      return (
        next === "DRAWING" ||
        next === "PAUSED" ||
        next === "CLAIMING" ||
        next === "FINISHED" ||
        next === "ERROR"
      );
    case "PAUSED":
      return (
        next === "READY" ||
        next === "WAITING_AUTO" ||
        next === "FINISHED" ||
        next === "ERROR"
      );
    case "CLAIMING":
      return next === "PAUSED" || next === "READY" || next === "FINISHED" || next === "ERROR";
    case "FINISHED":
      return next === "SETUP" || next === "ERROR";
    case "ERROR":
      return next === "SETUP";
    default:
      return false;
  }
}

export function canDrawNextBall(session: { status: GameStatus; currentIndex: number }): boolean {
  return (
    (session.status === "READY" || session.status === "WAITING_AUTO") &&
    session.currentIndex < 75
  );
}

export function canPauseGame(session: { status: GameStatus }): boolean {
  return (
    session.status === "READY" ||
    session.status === "DRAWING" ||
    session.status === "ANNOUNCING" ||
    session.status === "WAITING_AUTO"
  );
}

export function canResumeGame(session: { status: GameStatus }): boolean {
  return session.status === "PAUSED";
}

export function canRegisterClaim(session: { status: GameStatus }): boolean {
  return (
    session.status === "READY" ||
    session.status === "WAITING_AUTO" ||
    session.status === "PAUSED" ||
    session.status === "CLAIMING"
  );
}

export function canFinishGame(session: { status: GameStatus }): boolean {
  return session.status !== "SETUP" && session.status !== "FINISHED";
}
