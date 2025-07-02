// Import scenes
import { FactorialScene } from './scenes/FactorialScene';
import { FibonacciScene } from './scenes/FibonacciScene';
import { BubbleSortScene } from './scenes/BubbleSortScene';
// import MergeSortScene from './scenes/MergeSortScene'; // For future
// import QuickSortScene from './scenes/QuickSortScene'; // For future

// Centralized level metadata for Algorithm Quest

export interface LevelControl {
  label: string;
  value: string;
}

export interface LevelMeta {
  id: number;
  name: string;
  title: string;
  description: string;
  algorithm: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  maxScore: number;
  timeComplexity: string;
  spaceComplexity: string;
  tutorial?: string;
  objective?: string;
  controls: LevelControl[];
  sceneKey: string;
  component: any; // Phaser scene class
  unlocksAtLevel?: number; // Level required to unlock
}

export const LEVELS: LevelMeta[] = [
  {
    id: 1,
    name: 'Mystical Vault of Factorion',
    title: 'Vault of Factorion',
    description: 'Descend through the mystical Vault of Factorion, platform by platform, unraveling a recursive spell. At the base lies a radiant star—return with newfound power to complete the magical ascent.',
    algorithm: 'Recursion (Factorial)',
    difficulty: 'beginner',
    maxScore: 100,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    tutorial: 'Jump across platforms to make recursive function calls. Watch the call stack grow and understand how recursion works for factorial.',
    objective: 'Complete the recursive sequence to unlock the exit door.',
    controls: [
      { label: 'Move', value: '←/→' },
      { label: 'Jump', value: '↑' }
    ],
    sceneKey: 'FactorialScene',
    component: FactorialScene,
  },
  {
    id: 2,
    name: 'Spiral Sanctum of Fibonacci',
    title: 'Spiral Sanctum of Fibonacci',
    description: 'Traverse the enchanted Spiral Sanctum of Fibonacci, where stars unlock shifting paths. As platforms vanish and emerge, uncover the hidden rhythm woven deep within the sanctuary\'s recursive enchantments.',
    algorithm: 'Recursion (Fibonacci)',
    difficulty: 'beginner',
    maxScore: 150,
    timeComplexity: 'O(2^n)',
    spaceComplexity: 'O(n)',
    tutorial: 'Navigate the Fibonacci tree and collect values to understand recursive calls.',
    objective: 'Collect all Fibonacci values to complete the sequence.',
    controls: [
      { label: 'Move', value: '←/→' },
      { label: 'Jump', value: '↑' }
    ],
    sceneKey: 'FibonacciScene',
    component: FibonacciScene,
    unlocksAtLevel: 1,
  },
  {
    id: 3,
    name: 'Bubble Labyrinth of Shadows',
    title: 'Bubble Labyrinth of Shadows',
    description: 'Venture into the Bubble Labyrinth of Shadows, where only two runeplates shine at a time and the rest are cloaked in darkness. Shift your window, swap the glowing runeplates, and illuminate the path to order by unraveling the secrets of Bubble Sort.',
    algorithm: 'Bubble Sort',
    difficulty: 'intermediate',
    maxScore: 250,
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
    tutorial: "Use the arrow keys to shift your window of two numbers. Press 'S' to swap their positions. When you believe the numbers are in ascending order, press Spacebar to invoke sort verification. Only three attempts are granted!",
    objective: 'Sort the array using Bubble Sort logic to unlock the next level.',
    controls: [
      { label: 'Move Window', value: '←/→' },
      { label: 'Swap Runeplates', value: 'S' },
      { label: 'Invoke Sort Verification Spell', value: 'Spacebar' }
    ],
    sceneKey: 'BubbleSortScene',
    component: BubbleSortScene,
    unlocksAtLevel: 2,
  },
  // Add more levels here as needed
]; 