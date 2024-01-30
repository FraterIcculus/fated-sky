import sweph, { constants, } from 'sweph';
import { Body } from './bodies';

export const STANDARD_FLAGS = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;

// https://en.wikipedia.org/wiki/Ecliptic#Obliquity_of_the_ecliptic
export const OBLIQUITY = 23.4;

export const BODIES: Body[] = [
  'asc',
  'mc',
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'chiron',
];

export const BODY_NAME_SWISS_EPH_CONST: Record<string, number> = {
  sun: constants.SE_SUN,
  moon: constants.SE_MOON,
  mercury: constants.SE_MERCURY,
  venus: constants.SE_VENUS,
  mars: constants.SE_MARS,
  jupiter: constants.SE_JUPITER,
  saturn: constants.SE_SATURN,
  neptune: constants.SE_NEPTUNE,
  uranus: constants.SE_URANUS,
  pluto: constants.SE_PLUTO,
  chiron: constants.SE_CHIRON,
};

export const PLANET_SPEED_DAILY: {
  [key: string]: { min: number; max: number; avg: number };
} = {
  moon: { min: 12, max: 15, avg: 13 },
  sun: { min: 0.95, max: 1.05, avg: 1 },
  mercury: { min: 0.95, max: 1.35, avg: 1 },
  venus: { min: 0.6, max: 1.3, avg: 1 },
  mars: { min: 0.4, max: 0.8, avg: 0.5 },
  jupiter: { min: 0.03, max: 0.12, avg: 0.083 },
  saturn: { min: 0.02, max: 0.08, avg: 0.033 },
  uranus: { min: 0.01, max: 0.02, avg: 0.011 },
  neptune: { min: 0.005, max: 0.007, avg: 0.006 },
  pluto: { min: 0.002, max: 0.004, avg: 0.003 },
  chiron: { min: 0.1, max: 1, avg: 0.3 },
};

export type Position = {
  degrees: number;
  minutes: number;
  seconds: number;
  raw: number;
};

export function round5(x: number) {
  return Math.round(x * 100000) / 100000;
}

export function round3(x: number) {
  return Math.round(x * 1000) / 1000;
}

export function percentify(x: number) {
  return (x * 100).toFixed(1); 
}

export function toDegMinSec(decimal: number): Position {
  const decimalAbs = Math.abs(decimal);
  const deg = Math.floor(decimalAbs);
  const min = Math.floor((decimalAbs % 1) * 60);
  const sec = Math.floor((((decimalAbs % 1) * 60) % 1) * 60);
  return { degrees: deg, minutes: min, seconds: sec, raw: round5(decimal) };
}
