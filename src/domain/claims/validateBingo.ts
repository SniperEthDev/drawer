import { BingoCard } from "../bingo/types";

export interface BingoValidationResult {
  isValid: boolean;
  missingNumbers: number[];
  matchedCount: number;
  requiredCount: 24; // 25 cells minus 1 central "LIBRE" cell
}

/**
 * Validates a Bingo claim on a card.
 * A bingo is valid when all 24 non-free cells are marked/called.
 */
export function validateBingoClaim(
  card: BingoCard,
  validCalledNumbers: Set<number>
): BingoValidationResult {
  const missingNumbers: number[] = [];
  let matchedCount = 0;

  for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
    const row = card.rows[rowIndex];
    for (let colIndex = 0; colIndex < 5; colIndex++) {
      const cell = row[colIndex];
      if (cell === "LIBRE") {
        continue;
      }
      if (validCalledNumbers.has(cell)) {
        matchedCount++;
      } else {
        missingNumbers.push(cell);
      }
    }
  }

  return {
    isValid: missingNumbers.length === 0,
    missingNumbers,
    matchedCount,
    requiredCount: 24
  };
}
