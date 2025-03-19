import { shuffleArray } from './mathUtils';

// Pre-generate all multiplication problems (a, b, product) with a <= b and product <= 100
export const ALL_MULTIPLICATION_PROBLEMS: Array<[number, number, number]> = [];

for (let a = 1; a <= 100; a++) {
  // b starts from a to ensure uniqueness (commutative property) and product <= 100
  const maxB = Math.floor(100 / a);
  for (let b = a; b <= maxB; b++) {
    const product = a * b;
    if (product <= 100) {
      ALL_MULTIPLICATION_PROBLEMS.push([a, b, product]);
    }
  }
}

// Pre-generate all division problems (dividend, divisor, quotient) based on the multiplication problems
// For each multiplication fact, include [product, a, b]. If a and b differ, also include [product, b, a] to allow both orders.
export const ALL_DIVISION_PROBLEMS: Array<[number, number, number]> = [];

for (let a = 1; a <= 100; a++) {
  const maxB = Math.floor(100 / a);
  for (let b = a; b <= maxB; b++) {
    const product = a * b;
    if (product <= 100) {
      ALL_DIVISION_PROBLEMS.push([product, a, b]);
      if (a !== b) {
        ALL_DIVISION_PROBLEMS.push([product, b, a]);
      }
    }
  }
}

// Utility function to get quiz multiplication problems based on selected numbers and count
// If a single number is selected, we return problems where the first factor equals the selected number and the second factor is between 1 and 10.
// For multiple selected numbers, we return problems where both factors are in the selectedNumbers array.
export function getQuizMultiplicationProblems(selectedNumbers: number[], count: number): Array<[number, number, number]> {
  let problems: Array<[number, number, number]> = [];
  if (selectedNumbers.length === 0) {
    return problems;
  }
  
  if (selectedNumbers.length === 1) {
    const selectedNumber = selectedNumbers[0];
    // For a single number, use its multiplication table (1 to 10)
    problems = ALL_MULTIPLICATION_PROBLEMS.filter(([a, b]) => a === selectedNumber && b >= 1 && b <= 10);
  } else {
    // For multiple numbers, generate the union of multiplication tables for each selected number (from 1 to 10)
    // Avoid duplicates: if the multiplier is also a selected number and is less than the current number, skip it.
    const sorted = [...selectedNumbers].sort((a, b) => a - b);
    for (const n of sorted) {
      for (let i = 1; i <= 10; i++) {
        if (sorted.includes(i) && i < n) continue;
        problems.push([n, i, n * i]);
      }
    }
  }
  
  // Randomly swap operands with 50% probability for each problem (if they differ) to vary the display order
  for (let i = 0; i < problems.length; i++) {
    const [a, b, product] = problems[i];
    if (a !== b && Math.random() < 0.5) {
      problems[i] = [b, a, product];
    }
  }
  
  problems = shuffleArray(problems);
  return problems.slice(0, count);
}

// Utility function to get quiz division problems based on selected numbers, a dividend range, and count
// This filters problems where the dividend is within the specified range, the divisor is one of the selectedNumbers, and the quotient (the answer) is <= 10.
export function getQuizDivisionProblems(selectedNumbers: number[], dividendRange: [number, number], count: number): Array<[number, number, number]> {
  let problems: Array<[number, number, number]> = [];
  const [minDividend, maxDividend] = dividendRange;
  if (selectedNumbers.length === 0) {
    return problems;
  }
  
  problems = ALL_DIVISION_PROBLEMS.filter(([dividend, divisor, quotient]) => {
    return dividend >= minDividend && dividend <= maxDividend && selectedNumbers.includes(divisor) && quotient <= 10;
  });
  
  problems = shuffleArray(problems);
  return problems.slice(0, count);
} 