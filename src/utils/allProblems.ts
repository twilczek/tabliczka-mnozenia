import { shuffleArray } from './mathUtils';
import problemSets from './problemSets.json';

// Define types for our problem sets
type ProblemTuple = [number, number, number];
type ProblemSets = {
  multiplication: Record<string, ProblemTuple[]>;
  division: Record<string, ProblemTuple[]>;
};

// Type assertion for the imported JSON - use unknown first to avoid type errors
const typedProblemSets = problemSets as unknown as ProblemSets;

// Utility function to get quiz multiplication problems based on selected numbers and count
export function getQuizMultiplicationProblems(selectedNumbers: number[], count: number): Array<ProblemTuple> {
  let problems: Array<ProblemTuple> = [];
  if (selectedNumbers.length === 0) {
    return problems;
  }
  
  // Get problems for each selected number
  for (const number of selectedNumbers) {
    const numberProblems = typedProblemSets.multiplication[number.toString()];
    if (numberProblems) {
      problems = [...problems, ...numberProblems];
    }
  }
  
  // Filter out duplicates for multiple numbers
  if (selectedNumbers.length > 1) {
    // Create a map of unique problems using a string key
    const uniqueProblems = new Map<string, ProblemTuple>();
    
    for (const problem of problems) {
      const [a, b] = problem;
      // Create a key based on the factors (order doesn't matter in multiplication)
      const key = [Math.min(a, b), Math.max(a, b)].join('x');
      
      if (!uniqueProblems.has(key)) {
        uniqueProblems.set(key, problem);
      }
    }
    
    // Convert back to array
    problems = Array.from(uniqueProblems.values());
  }
  
  // Randomly swap operands with 50% probability for each problem (if they differ) to vary the display order
  for (let i = 0; i < problems.length; i++) {
    const [a, b, product] = problems[i];
    if (a !== b && Math.random() < 0.5) {
      problems[i] = [b, a, product];
    }
  }
  
  problems = shuffleArray(problems);
  
  // If we need more problems than are uniquely available, we'll duplicate them
  const uniqueProblemsCount = problems.length;
  if (uniqueProblemsCount < count && uniqueProblemsCount > 0) {
    // Calculate how many full sets we need and the remainder
    const fullSets = Math.floor(count / uniqueProblemsCount);
    const remainder = count % uniqueProblemsCount;
    
    // Create a new array with duplicated problems
    const duplicatedProblems: Array<ProblemTuple> = [];
    
    // Add full sets
    for (let i = 0; i < fullSets; i++) {
      // Each set should be shuffled independently to avoid patterns
      duplicatedProblems.push(...shuffleArray([...problems]));
    }
    
    // Add the remainder
    if (remainder > 0) {
      duplicatedProblems.push(...shuffleArray([...problems]).slice(0, remainder));
    }
    
    return duplicatedProblems;
  }
  
  return problems.slice(0, count);
}

// Utility function to get quiz division problems based on selected numbers, a dividend range, and count
export function getQuizDivisionProblems(selectedNumbers: number[], dividendRange: [number, number], count: number): Array<ProblemTuple> {
  let problems: Array<ProblemTuple> = [];
  const [minDividend, maxDividend] = dividendRange;
  if (selectedNumbers.length === 0) {
    return problems;
  }
  
  // Get problems for each selected number
  for (const number of selectedNumbers) {
    const numberProblems = typedProblemSets.division[number.toString()];
    if (numberProblems) {
      // Filter by dividend range
      const filteredProblems = numberProblems.filter(
        ([dividend]) => dividend >= minDividend && dividend <= maxDividend
      );
      problems = [...problems, ...filteredProblems];
    }
  }
  
  problems = shuffleArray(problems);
  
  // If we need more problems than are uniquely available, we'll duplicate them
  const uniqueProblemsCount = problems.length;
  if (uniqueProblemsCount < count && uniqueProblemsCount > 0) {
    // Calculate how many full sets we need and the remainder
    const fullSets = Math.floor(count / uniqueProblemsCount);
    const remainder = count % uniqueProblemsCount;
    
    // Create a new array with duplicated problems
    const duplicatedProblems: Array<ProblemTuple> = [];
    
    // Add full sets
    for (let i = 0; i < fullSets; i++) {
      // Each set should be shuffled independently to avoid patterns
      duplicatedProblems.push(...shuffleArray([...problems]));
    }
    
    // Add the remainder
    if (remainder > 0) {
      duplicatedProblems.push(...shuffleArray([...problems]).slice(0, remainder));
    }
    
    return duplicatedProblems;
  }
  
  return problems.slice(0, count);
} 