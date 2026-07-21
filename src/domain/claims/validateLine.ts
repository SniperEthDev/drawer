import { BingoCard } from "../bingo/types";

export interface LineValidationResult {
  isValid: boolean;
  completedRows: number[]; // 0-indexed indices of the rows that are valid
  missingNumbersByRow: Record<number, number[]>; // numbers missing for each row
}

/**
 * Validates a Line claim on a card.
 * A line is valid when any of the 5 horizontal rows is complete.
 * The central cell (row 2, column 2) is "LIBRE" and always counts as marked.
 */
export function validateLineClaim(
  card: BingoCard,
  validCalledNumbers: Set<number>
): LineValidationResult {
  const completedRows: number[] = [];
  const missingNumbersByRow: Record<number, number[]> = {};

  for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
    const row = card.rows[rowIndex];
    const missing: number[] = [];

    for (let colIndex = 0; colIndex < 5; colIndex++) {
      const cell = row[colIndex];
      if (cell === "LIBRE") {
        continue;
      }
      if (!validCalledNumbers.has(cell)) {
        missing.push(cell);
      }
    }

    if (missing.length === 0) {
      completedRows.push(rowIndex);
    } else {
      missingNumbersByRow[rowIndex] = missing;
    }
  }

  return {
    isValid: completedRows.length > 0,
    completedRows,
    missingNumbersByRow
  };
}
