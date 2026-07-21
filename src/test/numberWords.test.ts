import { describe, it, expect } from "vitest";
import { numberToWordsES } from "../domain/bingo/numberWords";

describe("Spanish Number translation", () => {
  it("translates key values correctly", () => {
    expect(numberToWordsES(1)).toBe("uno");
    expect(numberToWordsES(10)).toBe("diez");
    expect(numberToWordsES(16)).toBe("dieciséis");
    expect(numberToWordsES(21)).toBe("veintiuno");
    expect(numberToWordsES(30)).toBe("treinta");
    expect(numberToWordsES(31)).toBe("treinta y uno");
    expect(numberToWordsES(54)).toBe("cincuenta y cuatro");
    expect(numberToWordsES(75)).toBe("setenta y cinco");
  });
});
