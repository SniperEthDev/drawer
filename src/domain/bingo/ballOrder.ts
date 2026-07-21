import { BingoLetter } from "./types";

export function getBingoLetter(num: number): BingoLetter {
  if (num >= 1 && num <= 15) return "B";
  if (num >= 16 && num <= 30) return "I";
  if (num >= 31 && num <= 45) return "N";
  if (num >= 46 && num <= 60) return "G";
  if (num >= 61 && num <= 75) return "O";
  throw new Error(`Número de bola fuera de rango (1-75): ${num}`);
}

export function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  const range = maxExclusive;
  const maxUint32 = 0xffffffff;
  const discardLimit = maxUint32 - (maxUint32 % range);
  
  const buffer = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buffer);
    const val = buffer[0];
    if (val < discardLimit) {
      return val % range;
    }
  }
}

export function createSecureBallOrder(): number[] {
  const balls = Array.from({ length: 75 }, (_, i) => i + 1);
  // Fisher-Yates seguro
  for (let i = balls.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    const temp = balls[i];
    balls[i] = balls[j];
    balls[j] = temp;
  }
  return balls;
}

export async function calculateSHA256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function createOrderCommitment(
  sessionId: string,
  nonce: string,
  shuffledBalls: number[]
): Promise<string> {
  const data = sessionId + nonce + JSON.stringify(shuffledBalls);
  return calculateSHA256(data);
}
