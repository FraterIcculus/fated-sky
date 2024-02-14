import { constants, calc_ut } from 'sweph';
import { DateTime, Duration } from 'luxon';
import { toJulianDate } from './dates';
import {
  BODY_NAME_SWISS_EPH_CONST,
  Position,
  round5,
  toDegMinSec,
} from './common';
import { Body } from './bodies';
import { BodyHousePositions } from './houses';
import ansis from "ansis";

export const ASPECT_GLYPHS: { [key: string]: string } = {
  con: "☌", // Conjunction
  opp: "☍", // Opposition
  squ: "□", // Square
  tri: "△", // Trine
  sex: "⚹", // Sextile
  sem: "∠"  // Semisquare 
};

export const COLORED_ASPECT_GLYPHS: { [key: string]: string } = {
  con: ansis.whiteBright("☌"), // Conjunction
  opp: ansis.redBright("☍"), // Opposition
  squ: ansis.redBright("□"), // Square
  tri: ansis.greenBright("△"), // Trine
  sex: ansis.green("⚹"), // Sextile
  sem: ansis.red("∠")  // Semisquare 
}

type AspectType = 'con' | 'opp' | 'squ' | 'tri' | 'sex' | 'sem';
type Angle = { degrees: number; minutes: number; seconds: number; raw: number };
type Aspect = {
  aspect: string;
  orb: Position;
};
type Aspects = {
  [K in Body]: {
    [K in Body]: Aspect;
  };
};

export const ORBS_CON_OPP_SQ_TRI = {
  default: 10,
  sun: 10,
  moon: 10,
  mercury: 10,
  venus: 10,
  mars: 10,
  jupiter: 10,
  saturn: 10,
  neptune: 10,
  uranus: 10,
  pluto: 10,
  chiron: 10,
};

export const ORBS_SEX = {
  default: 6,
  sun: 6,
  moon: 6,
  mercury: 6,
  venus: 6,
  mars: 6,
  jupiter: 6,
  saturn: 6,
  neptune: 6,
  uranus: 6,
  pluto: 6,
  chiron: 6,
};

export const ORBS_SEM = {
  default: 3,
  sun: 3,
  moon: 3,
  mercury: 3,
  venus: 3,
  mars: 3,
  jupiter: 3,
  saturn: 3,
  neptune: 3,
  uranus: 3,
  pluto: 3,
  chiron: 3,
};

export const ASPECTS: Record<AspectType, { angle: number; orb: any }> = {
  con: { angle: 0, orb: { ...ORBS_CON_OPP_SQ_TRI } },
  opp: { angle: 180, orb: { ...ORBS_CON_OPP_SQ_TRI } },
  squ: { angle: 90, orb: { ...ORBS_CON_OPP_SQ_TRI } },
  tri: { angle: 120, orb: { ...ORBS_CON_OPP_SQ_TRI } },
  sex: { angle: 60, orb: { ...ORBS_SEX } },
  sem: { angle: 30, orb: { ...ORBS_SEM } },
};

/**
 *
 * @param angle The angle between bodyOne and bodyTwo, already calculated.
 * @param bodyOne A string, used to look up the aspects.
 * @param bodyTwo A string, used to look up the aspects.
 * @param aspects A map, see ASPECTS, that we're searching.
 * @returns
 */
export function getZodicalAspect(
  angle: Angle,
  bodyOne: Body,
  bodyTwo: Body,
  aspects: any
) {
  const cmpAngle = Math.abs(angle.raw);
  for (let [aspect, v] of Object.entries(aspects)) {
    let va = v as any;
    const aspectAngle = va.angle;
    let orb = Math.max(va.orb[bodyOne], va.orb[bodyTwo]);
    orb = !Number.isNaN(orb) ? orb : va.orb['default'];
    if (cmpAngle >= aspectAngle - orb && cmpAngle <= aspectAngle + orb) {
      let angleOrb = cmpAngle - aspectAngle;
      // console.log(
      //   `Found: ${aspect} orb ${JSON.stringify(
      //     toDegMinSec(angleOrb)
      //   )} - ${angleOrb}`
      // );
      // We break on the first match, so the order of inputs matters a bit
      // and should be ranked in order of importance.
      return {
        aspect: aspect,
        orb: toDegMinSec(angleOrb),
      };
    }
  }
  return undefined;
}

export function makeAngle(bLong1: number, bLong2: number): Angle {
  return {
    ...toDegMinSec(bLong1 - bLong2),
    raw: bLong1 - bLong2,
  };
}

export function getZodicalAngle(
  date: DateTime,
  location: [lon: number, lat: number],
  bodyOne: Body,
  bodyTwo: Body
): Angle {
  console.log(`${bodyOne} - ${bodyTwo}`);
  const flags = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;
  let bp1 = calc_ut(
    toJulianDate(date),
    BODY_NAME_SWISS_EPH_CONST[bodyOne],
    flags
  );
  let bp2 = calc_ut(
    toJulianDate(date),
    BODY_NAME_SWISS_EPH_CONST[bodyTwo],
    flags
  );

  return makeAngle(bp1.data[0], bp2.data[0]);
}

/**
 *
 * @param start The date to start the search in.
 * @param end The date to end the search by.
 * @param location The on-earth geographical observation location.
 * @param bodyOne The first body.
 * @param bodyTwo The second body.
 * @param aspects Which aspects to search for, see ASPECTS.
 * @param increment What Duration to increment by.
 * @returns A map of all date times generated to any found aspects. The map will always contain `start` and `end`.
 */
export function searchAspects(
  start: DateTime,
  end: DateTime,
  location: [lon: number, lat: number],
  bodyOne: Body,
  bodyTwo: Body,
  aspects: any,
  increment: Duration
): Map<DateTime, any | undefined> {
  let returnMap = new Map();
  for (let current = start; current < end; current = current.plus(increment)) {
    let zAngle = getZodicalAngle(current, location, bodyOne, bodyTwo);
    let zAspect = getZodicalAspect(zAngle, bodyOne, bodyTwo, aspects);
    returnMap.set(current, zAspect);
  }
  // ensure the last date is in the map.
  if (!returnMap.has(end)) {
    let zAngle = getZodicalAngle(end, location, bodyOne, bodyTwo);
    let zAspect = getZodicalAspect(zAngle, bodyOne, bodyTwo, aspects);
    returnMap.set(end, zAspect);
  }
  return returnMap;
}

export function multiBodyAspectSearch(
  start: DateTime,
  end: DateTime,
  location: [lon: number, lat: number],
  aBodies: Body[],
  bBodies: Body[],
  aspects: any,
  increment: Duration
) {
  let accum: { [key: string]: any } = {};
  for (const bodyNameA of aBodies) {
    accum[bodyNameA] = {};
    for (const bodyNameB of bBodies) {
      if (bodyNameA === bodyNameB) continue;
      accum[bodyNameA][bodyNameB] = summarizeAspectSearch(
        searchAspects(
          start,
          end,
          location,
          bodyNameA,
          bodyNameB,
          aspects,
          increment
        )
      );
    }
  }
  return accum;
}

export function summarizeAspectSearch(search: Map<DateTime, any | undefined>) {
  let arr = Array.from(search);
  let lastItem = arr[arr.length - 1];
  let firstItem = arr[0];
  let full =
    firstItem[1] != undefined && lastItem && lastItem[1] != undefined
      ? true
      : false;

  let first = arr.find((v) => v[1]?.orb.raw !== undefined);
  let last = arr.reverse().find((v) => v[1]?.orb.raw !== undefined);
  arr.sort((a, b) => {
    if (a[1] !== undefined && b[1] != undefined) {
      return a[1].orb.raw - b[1].orb.raw;
    } else if (a[1] !== undefined) {
      return -1;
    } else if (b[1] !== undefined) {
      return -1;
    } else {
      return 1;
    }
  });
  let min = arr.find((v) => v[1]?.orb.raw !== undefined);

  return { full, first, last, min };
}

/**
 *
 * @param bodies The planetary bodies under consideration for aspect generation.
 * @param aspects See ASPECTS, the aspects we want to look for.
 * @returns
 */
export function aspectsForBodies(
  bodies: BodyHousePositions,
  aspects: any = ASPECTS
): Aspects {
  return Object.keys(bodies).reduce((acc: any, bodyName: string) => {
    if (bodyName !== 'cusps') {
      let b1 = bodies[bodyName as Body];
      let iacc = Object.keys(bodies).reduce((iacc: any, iBodyName: string) => {
        // Inner
        if (bodyName !== iBodyName && iBodyName !== 'cusps') {
          let b2 = bodies[iBodyName as Body];
          let angle = makeAngle(b1.position.raw, b2.position.raw);
          let aspect = getZodicalAspect(
            angle,
            bodyName as Body,
            iBodyName as Body,
            aspects
          );
          iacc[iBodyName] = aspect;
        }
        return iacc;
      }, {});

      acc[bodyName] = iacc;
    }
    return acc;
  }, {}) as unknown as Aspects;
}
