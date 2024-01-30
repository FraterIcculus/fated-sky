import { Position } from './common';

export const DEGREES_PER_MANSION = 12.85714;

export const mansionsOfTheMoon = [
  { name: 'Al-Sharatain', meaning: 'The Two Signals' },
  { name: 'Al-Butain', meaning: 'The Little Belly' },
  { name: 'Al-Thurayya', meaning: 'The Many Little Ones' },
  { name: 'Al-Dabaran', meaning: 'The Follower' },
  { name: 'Al-Haqa', meaning: 'The White Spot' },
  { name: 'Al-Hana', meaning: 'The Mark' },
  { name: 'Al-Dhira', meaning: 'The Forearm' },
  { name: 'Al-Nathrah', meaning: 'The Gap' },
  { name: 'Al-Tarf', meaning: 'The Eyes' },
  { name: 'Al-Jabhah', meaning: 'The Brow' },
  { name: 'Al-Zubrah', meaning: 'The Mane' },
  { name: 'Al-Sarfah', meaning: 'The Changer' },
  { name: 'Al-Awwa', meaning: 'The Barker' },
  { name: 'Al-Simak', meaning: 'The Unarmed' },
  { name: 'Al-Ghafr', meaning: 'The Covering' },
  { name: 'Al-Zubana', meaning: 'The Claws' },
  { name: 'Al-Iklil', meaning: 'The Crown' },
  { name: 'Al-Qalb', meaning: 'The Heart' },
  { name: 'Al-Sharatan', meaning: 'The Two Signs' },
  { name: 'Al-Ghafar', meaning: 'The Forerunner' },
  { name: 'Al-Risha', meaning: 'The Rope' },
  { name: 'Al-Fawwaz', meaning: 'The Bright' },
  { name: 'Al-Dhira', meaning: 'The Foreleg' },
  { name: 'Al-Batn al-Hut', meaning: 'The Belly of the Fish' },
  { name: "Al-Sa'd al-Dhabih", meaning: 'The Lucky One of the Slaughter' },
  { name: "Al-Sa'd Bula", meaning: 'The Lucky One of the Swallower' },
  { name: "Al-Sa'd al-Su'ud", meaning: 'The Lucky One of the Luck' },
  { name: 'Al-Ahil', meaning: 'The Empty' },
];

/**
 *
 * @param moon The Position of the moon.
 * @returns The Tropical mansion for the given moon Position.
 */
export function getMansionFromPosition(moon: Position) {
  let p = Math.abs(moon.raw) / DEGREES_PER_MANSION;
  return { ...mansionsOfTheMoon[Math.floor(p)], mansion: Math.floor(p) + 1 };
}

// TODO: Given start/end times:
//       list when the moon is in a mansion
//       list when it enters and exits
const ms = [
  {
    mansion: 1,
    name: '',
    meaning: '',
    enters: '',
    leaves: '',
  },
];
