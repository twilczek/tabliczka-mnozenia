// Generate a random integer between min and max (inclusive)
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get a random item from an array
export function getRandomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate a random multiplication problem with selected numbers
export function generateMultiplicationProblem(
  minFactor: number, 
  maxFactor: number,
  selectedNumbers?: number[],
  lastProblem?: [number, number, number] | null
): [number, number, number] {
  let a: number, b: number, result: number;
  let isLastProblem = false;

  // Generate a problem until it's different from the last one
  do {
    // If we have selected numbers, use those instead of a range
    if (selectedNumbers && selectedNumbers.length > 0) {
      // If only one number is selected, use it as one of the factors
      // and get a random number 1-10 for the other factor
      if (selectedNumbers.length === 1) {
        const selectedNumber = selectedNumbers[0];
        // Always use selected number as first factor for clarity
        a = selectedNumber;
        b = getRandomInt(1, 10);
        result = a * b;
      } else {
        // If multiple numbers selected, choose from the selected numbers
        a = getRandomFromArray(selectedNumbers);
        b = getRandomFromArray(selectedNumbers);
        result = a * b;
      }
    } else {
      // Fallback to range-based generation
      a = getRandomInt(minFactor, maxFactor);
      b = getRandomInt(minFactor, maxFactor);
      result = a * b;
    }

    // Check if this problem is the same as the last one
    // We consider it the same if both factors match, even if they are in a different order
    isLastProblem = lastProblem !== undefined && lastProblem !== null && (
      (a === lastProblem[0] && b === lastProblem[1]) || 
      (a === lastProblem[1] && b === lastProblem[0])
    );

    // If we only have one number in selectedNumbers and only 10 possible questions,
    // we might need to allow the same problem to avoid an infinite loop
    // but we'll try to swap the factors at least
    if (isLastProblem && selectedNumbers && selectedNumbers.length === 1) {
      if (a !== b) { // Can swap if factors are different
        const temp = a;
        a = b;
        b = temp;
        // Safe cast - we already checked lastProblem is not null or undefined above
        isLastProblem = lastProblem ? (a === lastProblem[0] && b === lastProblem[1]) : false;
      } else {
        // If factors are identical (e.g., 5×5), just accept it
        break;
      }
    }
  } while (isLastProblem);

  return [a, b, result];
}

// Generate a random division problem
// This ensures we only get problems with whole number answers
export function generateDivisionProblem(
  minDividend: number, 
  maxDividend: number,
  selectedNumbers?: number[],
  lastProblem?: [number, number, number] | null
): [number, number, number] {
  let dividend: number, divisor: number, quotient: number;
  let isLastProblem = false;
  let attempts = 0; // Licznik prób, aby uniknąć nieskończonej pętli

  do {
    if (selectedNumbers && selectedNumbers.length > 0) {
      // If only one number is selected, always use it as the divisor
      if (selectedNumbers.length === 1) {
        divisor = selectedNumbers[0];
        quotient = getRandomInt(1, 10); // Ograniczenie wyniku do maksymalnie 10
        dividend = divisor * quotient;
      } else {
        // For division with multiple selected numbers:
        // 1. Pick a divisor from selected numbers
        // 2. Pick a quotient (result) from 1-10 (ograniczone do 10)
        // 3. Calculate dividend as divisor * quotient
        divisor = getRandomFromArray(selectedNumbers);
        quotient = getRandomInt(1, 10); // Wynik nie większy niż 10
        dividend = divisor * quotient;
      }

      // Jeśli używamy wybranych liczb, ale dzielna nie mieści się w wybranym zakresie,
      // generujemy nowe zadanie dla trybu z przedziałem liczbowym
      if (dividend < minDividend || dividend > maxDividend) {
        // Jednak pozwalamy na maximum 20 prób, aby uniknąć nieskończonej pętli
        attempts++;
        if (attempts > 20) {
          // Jeśli po 20 próbach nie udało się wygenerować zadania z wybranego zakresu,
          // tworzymy zadanie które mieści się jak najbliżej wybranego zakresu
          dividend = Math.max(minDividend, Math.min(maxDividend, dividend));
          break;
        }
        continue;
      }
    } else {
      // Generowanie problemów w oparciu o wybrany zakres (dzielna)
      
      // Próbujemy wygenerować dzielną bezpośrednio z zakresu
      // Najpierw wybieramy losową dzielną z zakresu
      const potentialDividends = [];
      
      // Dla zakresu trudnego, chcemy mieć większą szansę na większe liczby
      if (minDividend >= 61) { // Trudny zakres
        // Grupuj możliwe dzielne według dzielników
        for (let i = 2; i <= 10; i++) { // Dzielniki 2-10
          for (let j = 1; j <= 10; j++) { // Wyniki 1-10
            const possibleDividend = i * j;
            if (possibleDividend >= minDividend && possibleDividend <= maxDividend) {
              potentialDividends.push({ dividend: possibleDividend, divisor: i, quotient: j });
            }
          }
        }
        
        // Jeśli znaleziono potencjalne dzielne, wybierz jedną losowo
        if (potentialDividends.length > 0) {
          const selected = getRandomFromArray(potentialDividends);
          dividend = selected.dividend;
          divisor = selected.divisor;
          quotient = selected.quotient;
        } else {
          // Awaryjnie - jeśli nie znaleziono żadnych odpowiednich dzielnych,
          // generujemy standardowo
          divisor = getRandomInt(2, 10);
          quotient = getRandomInt(1, 10);
          // Próbujemy dopasować dzielną do zakresu
          dividend = divisor * quotient;
          if (dividend < minDividend || dividend > maxDividend) {
            attempts++;
            if (attempts > 20) break;
            continue;
          }
        }
      } else {
        // Dla zakresów łatwego i średniego generujemy standardową metodą
        divisor = getRandomInt(2, 10);
        quotient = getRandomInt(1, 10);
        dividend = divisor * quotient;
        
        // Sprawdzamy czy obliczona dzielna mieści się w wybranym zakresie trudności
        if (dividend < minDividend || dividend > maxDividend) {
          attempts++;
          if (attempts > 20) {
            // Po wielu próbach, po prostu dostosuj do najbliższej wartości w zakresie
            dividend = Math.max(minDividend, Math.min(maxDividend, dividend));
            break;
          }
          continue;
        }
      }
    }

    // Check if this problem is the same as the last one
    isLastProblem = lastProblem !== undefined && lastProblem !== null && 
                     dividend === lastProblem[0] && divisor === lastProblem[1];

    // Zwiększ licznik prób, aby uniknąć nieskończonej pętli
    attempts++;
    
    // Po zbyt dużej liczbie prób, po prostu zaakceptuj zadanie
    if (attempts > 30) break;

  } while (isLastProblem || dividend < minDividend || dividend > maxDividend);
  
  return [dividend, divisor, quotient];
}

// Format the problem as a string for display
export function formatProblem(a: number, b: number, operator: '*' | '/'): string {
  return `${a} ${operator} ${b}`;
}

// Check if the provided answer is correct
export function checkAnswer(a: number, b: number, operator: '*' | '/', userAnswer: number): boolean {
  if (operator === '*') {
    return a * b === userAnswer;
  } else {
    return a / b === userAnswer;
  }
}

// Calculate maximum number of possible questions for selected numbers
export function calculateMaxQuestions(selectedNumbers: number[]): number {
  if (selectedNumbers.length === 0) return 0;
  
  if (selectedNumbers.length === 1) {
    // With one number, we can have up to 10 questions (1-10)
    return 10;
  } else {
    // With multiple numbers, we have n² possible combinations
    return selectedNumbers.length * selectedNumbers.length;
  }
}

// Generate all possible unique multiplication problems for selected numbers
export function generateAllMultiplicationProblems(
  selectedNumbers: number[]
): Array<[number, number, number]> {
  const problems: Array<[number, number, number]> = [];
  const usedPairs = new Set<string>();

  if (selectedNumbers.length === 0) return problems;

  if (selectedNumbers.length === 1) {
    // If only one number is selected, generate all combinations with 1-10
    const num = selectedNumbers[0];
    for (let i = 1; i <= 10; i++) {
      problems.push([num, i, num * i]);
    }
  } else {
    // For multiple numbers, generate all combinations between them
    for (const a of selectedNumbers) {
      for (const b of selectedNumbers) {
        // Create a unique key for this pair (order doesn't matter for multiplication)
        const key = a <= b ? `${a}x${b}` : `${b}x${a}`;
        
        if (!usedPairs.has(key)) {
          usedPairs.add(key);
          problems.push([a, b, a * b]);
        }
      }
    }
  }

  return problems;
}

// Generate all possible unique division problems for selected numbers
export function generateAllDivisionProblems(
  selectedNumbers: number[],
  maxQuotient: number = 10
): Array<[number, number, number]> {
  const problems: Array<[number, number, number]> = [];
  const usedPairs = new Set<string>();

  if (selectedNumbers.length === 0) return problems;

  if (selectedNumbers.length === 1) {
    // If only one number is selected, always use it as the divisor
    const divisor = selectedNumbers[0];
    for (let quotient = 1; quotient <= 10; quotient++) {
      const dividend = divisor * quotient;
      problems.push([dividend, divisor, quotient]);
    }
  } else {
    // For multiple numbers, generate all valid division problems
    for (const divisor of selectedNumbers) {
      for (let quotient = 1; quotient <= maxQuotient; quotient++) {
        const dividend = divisor * quotient;
        
        // Create a unique key for this problem
        const key = `${dividend}/${divisor}`;
        
        if (!usedPairs.has(key)) {
          usedPairs.add(key);
          problems.push([dividend, divisor, quotient]);
        }
      }
    }
  }

  return problems;
}

// Fisher-Yates shuffle algorithm for randomizing problems
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]; // Create a copy to avoid mutating the original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
  }
  return newArray;
}

// Generate a set of randomized, unique problems for a quiz
export function generateQuizProblems(
  mode: 'multiplication' | 'division',
  selectedNumbers: number[],
  count: number
): Array<[number, number, number]> {
  let allProblems: Array<[number, number, number]> = [];
  
  if (mode === 'multiplication') {
    allProblems = generateAllMultiplicationProblems(selectedNumbers);
  } else {
    allProblems = generateAllDivisionProblems(selectedNumbers);
  }
  
  // Shuffle all problems
  const shuffledProblems = shuffleArray(allProblems);
  
  // Return the requested number of problems (or all if count is higher)
  return shuffledProblems.slice(0, Math.min(count, shuffledProblems.length));
} 