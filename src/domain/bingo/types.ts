export type BingoLetter = "B" | "I" | "N" | "G" | "O";

export type GameStatus =
  | "SETUP"
  | "READY"
  | "DRAWING"
  | "ANNOUNCING"
  | "WAITING_AUTO"
  | "PAUSED"
  | "CLAIMING"
  | "FINISHED"
  | "ERROR";

export type DrawMode =
  | "MANUAL"
  | "SEMI_AUTOMATIC"
  | "AUTOMATIC";

export type ClaimType =
  | "LINE"
  | "BINGO"
  | "CUSTOM";

export interface CalledBall {
  id: string;
  number: number;
  letter: BingoLetter;
  sequence: number;
  calledAt: string;
  status: "VALID" | "REVOKED";
  revokedAt?: string;
  revocationReason?: string;
  voiceText: string;
}

export interface Winner {
  id: string;
  sessionId: string;
  type: ClaimType;
  customPrizeName?: string;
  name: string;
  cardSeries?: string;
  cardSerial?: string;
  winningBallNumber: number;
  winningBallLetter: BingoLetter;
  registeredAt: string;
  verificationStatus: "MANUAL" | "VERIFIED" | "REJECTED";
  completedLines?: number[];
  notes?: string;
}

export interface CustomPrize {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string; // hex or tailwind class
  pauseOnClaim: boolean;
  finishOnClaim: boolean;
  maxWinners: number;
}

export interface GameSettings {
  eventName: string;
  operatorName: string;
  roomName?: string;
  mode: DrawMode;
  automaticDelaySeconds: number;
  voiceEnabled: boolean;
  voiceName?: string;
  voiceLocale: string;
  voiceRate: number;
  voicePitch: number;
  voiceVolume: number;
  repeatAnnouncement: boolean;
  winnerVoiceAnnouncement: boolean;
  soundsEnabled: boolean;
  vibrationEnabled: boolean;
  wakeLockEnabled: boolean;
  pauseWhenHidden: boolean;
  customPrizes: CustomPrize[];
}

export interface GameSession {
  schemaVersion: 1;
  id: string;
  eventName: string;
  operatorName: string;
  roomName?: string;
  status: GameStatus;
  createdAt: string;
  startedAt?: string;
  updatedAt: string;
  completedAt?: string;
  shuffledBalls: number[];
  currentIndex: number;
  calledBalls: CalledBall[];
  winners: Winner[];
  settings: GameSettings;
  orderCommitment: string;
  auditNonce: string;
  importedManifestId?: string;
}

export interface AuditEvent {
  id: string;
  sessionId: string;
  sequence: number;
  type:
    | "SESSION_CREATED"
    | "SESSION_STARTED"
    | "BALL_DRAWN"
    | "BALL_ANNOUNCED"
    | "GAME_PAUSED"
    | "GAME_RESUMED"
    | "BALL_REVOKED"
    | "CLAIM_OPENED"
    | "CLAIM_VERIFIED"
    | "CLAIM_REJECTED"
    | "WINNER_REGISTERED"
    | "SESSION_FINISHED"
    | "SESSION_RECOVERED"
    | "SETTINGS_CHANGED";
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface ImportRecord {
  id: string;
  importedAt: string;
  fileName: string;
  cardCount: number;
}

export interface BingoCard {
  importId: string;
  series: string;
  serial: string;
  signature: string;
  // Fila por fila, columnas B, I, N, G, O
  // Cada elemento es un array de 5 números o "LIBRE" en N3
  rows: (number | "LIBRE")[][];
}
