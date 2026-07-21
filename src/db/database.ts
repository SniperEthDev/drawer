import Dexie, { type Table } from "dexie";
import { GameSession, AuditEvent, Winner, ImportRecord, BingoCard } from "../domain/bingo/types";

export class BulltechDrawerDB extends Dexie {
  sessions!: Table<GameSession, string>;
  auditEvents!: Table<AuditEvent, string>;
  winners!: Table<Winner, string>;
  imports!: Table<ImportRecord, string>;
  cards!: Table<BingoCard, number>;

  constructor() {
    super("BulltechDrawerDB");
    this.version(1).stores({
      sessions: "id, status, createdAt, updatedAt, completedAt",
      auditEvents: "id, sessionId, sequence, createdAt, type",
      winners: "id, sessionId, type, registeredAt",
      imports: "id, importedAt, fileName",
      cards: "++localId, importId, series, serial, signature, [importId+series], [importId+serial]"
    });
  }
}

export const db = new BulltechDrawerDB();
