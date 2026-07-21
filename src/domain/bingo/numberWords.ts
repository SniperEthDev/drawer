const ONES = [
  "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
  "diez", "once", "doce", "trece", "catorce", "quince"
];

const TENS = [
  "", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta"
];

export function numberToWordsES(num: number): string {
  if (num < 1 || num > 75) {
    throw new Error(`Número fuera de rango para traducción en español (1-75): ${num}`);
  }

  if (num <= 15) {
    return ONES[num];
  }

  if (num === 16) return "dieciséis";
  if (num === 17) return "diecisiete";
  if (num === 18) return "dieciocho";
  if (num === 19) return "diecinueve";

  if (num === 20) {
    return "veinte";
  }

  if (num < 30) {
    const unit = num % 10;
    if (unit === 1) return "veintiuno";
    if (unit === 2) return "veintidós";
    if (unit === 3) return "veintitrés";
    if (unit === 4) return "veinticuatro";
    if (unit === 5) return "veinticinco";
    if (unit === 6) return "veintiséis";
    if (unit === 7) return "veintisiete";
    if (unit === 8) return "veintiocho";
    if (unit === 9) return "veintinueve";
  }

  const tensDigit = Math.floor(num / 10);
  const unitDigit = num % 10;

  if (unitDigit === 0) {
    return TENS[tensDigit];
  }

  return `${TENS[tensDigit]} y ${ONES[unitDigit]}`;
}
