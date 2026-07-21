import { describe, it, expect } from "vitest";
import { getBingoLetter, createSecureBallOrder } from "../domain/bingo/ballOrder";

describe("Bingo Random and Orders", () => {
  it("determines correct letters for all ranges", () => {
    expect(getBingoLetter(1)).toBe("B");
    expect(getBingoLetter(15)).toBe("B");
    expect(getBingoLetter(16)).toBe("I");
    expect(getBingoLetter(30)).toBe("I");
    expect(getBingoLetter(31)).toBe("N");
    expect(getBingoLetter(45)).toBe("N");
    expect(getBingoLetter(46)).toBe("G");
    expect(getBingoLetter(60)).toBe("G");
    expect(getBingoLetter(61)).toBe("O");
    expect(getBingoLetter(75)).toBe("O");
    expect(() => getBingoLetter(0)).toThrow();
    expect(() => getBingoLetter(76)).toThrow();
  });

  it("produces valid shuffled list of 75 balls", () => {
    const balls = createSecureBallOrder();
    expect(balls.length).toBe(75);
    const sorted = [...balls].sort((a, b) => a - b);
    expect(sorted[0]).toBe(1);
    expect(sorted[74]).toBe(75);
    
    // Ensure all 75 numbers are present without duplicates
    const unique = new Set(balls);
    expect(unique.size).toBe(75);
  });
});
