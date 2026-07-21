import { describe, it, expect } from "vitest";
import { validateLineClaim } from "../domain/claims/validateLine";
import { validateBingoClaim } from "../domain/claims/validateBingo";
import { BingoCard } from "../domain/bingo/types";

// Standard Mock card for evaluation
const mockCard: BingoCard = {
  importId: "test",
  series: "001",
  serial: "12345",
  signature: "abc",
  rows: [
    [1, 16, 31, 46, 61],
    [2, 17, 32, 47, 62],
    [3, 18, "LIBRE", 48, 63],
    [4, 19, 34, 49, 64],
    [5, 20, 35, 50, 65]
  ]
};

describe("Card Claim Validations", () => {
  it("validates horizontal lines", () => {
    // Fila 1 completes: 1, 16, 31, 46, 61
    const calledSet = new Set([1, 16, 31, 46, 61]);
    const res = validateLineClaim(mockCard, calledSet);
    expect(res.isValid).toBe(true);
    expect(res.completedRows).toContain(0);
  });

  it("validates horizontal lines with center LIBRE cell", () => {
    // Fila 3: 3, 18, LIBRE, 48, 63
    const calledSet = new Set([3, 18, 48, 63]);
    const res = validateLineClaim(mockCard, calledSet);
    expect(res.isValid).toBe(true);
    expect(res.completedRows).toContain(2);
  });

  it("rejects incomplete lines", () => {
    const calledSet = new Set([1, 16, 46, 61]); // missing 31
    const res = validateLineClaim(mockCard, calledSet);
    expect(res.isValid).toBe(false);
  });

  it("validates full Bingo", () => {
    const allNumbers = [
      1, 16, 31, 46, 61,
      2, 17, 32, 47, 62,
      3, 18,     48, 63, // center is free
      4, 19, 34, 49, 64,
      5, 20, 35, 50, 65
    ];
    const calledSet = new Set(allNumbers);
    const res = validateBingoClaim(mockCard, calledSet);
    expect(res.isValid).toBe(true);
    expect(res.missingNumbers.length).toBe(0);
  });
});
