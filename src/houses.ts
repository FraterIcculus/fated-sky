import { DateTime } from "luxon";
import { Body, getBodyPositionZodiacal } from "./bodies";
import {
  BODY_NAME_SWISS_EPH_CONST,
  OBLIQUITY,
  Position,
  STANDARD_FLAGS,
  toDegMinSec,
} from "./common";
import { toJulianDate } from "./dates";
import sweph, { calc_ut, house_pos, houses } from "sweph";

export type ZodiacInfo = {
  element: string;
  elementGlyph: string;
  cardinality: string;
};
export type HouseInfo = {
  number: number;
  name: string;
  abbreviation: string;
  glyph: string;
};

type PlanetDignity = {
  rulership?: string;
  exaltation?: string;
  detriment?: string;
  fall?: string;
};

export const ZODIAC_DIGNITY: { [index: number]: PlanetDignity } = {
  1: {
    rulership: "Mars",
    exaltation: "Sun",
    detriment: "Venus",
    fall: "Saturn",
  }, // Aries
  2: {
    rulership: "Venus",
    exaltation: "Moon",
    detriment: "Mars",
    fall: "none",
  }, // Taurus
  3: {
    rulership: "Mercury",
    exaltation: "none",
    detriment: "Jupiter",
    fall: "none",
  }, // Gemini
  4: {
    rulership: "Moon",
    exaltation: "Jupiter",
    detriment: "Saturn",
    fall: "Mars",
  }, // Cancer
  5: {
    rulership: "Sun",
    exaltation: "none",
    detriment: "Saturn",
    fall: "none",
  }, // Leo
  6: {
    rulership: "Mercury",
    exaltation: "none",
    detriment: "Jupiter",
    fall: "Venus",
  }, // Virgo
  7: {
    rulership: "Venus",
    exaltation: "Saturn",
    detriment: "Mars",
    fall: "Sun",
  }, // Libra
  8: {
    rulership: "Mars",
    exaltation: "none",
    detriment: "Venus",
    fall: "Moon",
  }, // Scorpio
  9: {
    rulership: "Jupiter",
    exaltation: "none",
    detriment: "Mercury",
    fall: "none",
  }, // Sagittarius
  10: {
    rulership: "Saturn",
    exaltation: "Mars",
    detriment: "Moon",
    fall: "Jupiter",
  }, // Capricorn
  11: {
    rulership: "Saturn",
    exaltation: "none",
    detriment: "Sun",
    fall: "none",
  }, // Aquarius
  12: {
    rulership: "Jupiter",
    exaltation: "Venus",
    detriment: "Mercury",
    fall: "none",
  }, // Pisces
};

export const ZODIAC_INFO: { [index: number]: ZodiacInfo } = {
  1: { element: "Fire", elementGlyph: "🜂", cardinality: "Cardinal" }, // Aries
  2: { element: "Earth", elementGlyph: "🜃", cardinality: "Fixed" }, // Taurus
  3: { element: "Air", elementGlyph: "🜁", cardinality: "Mutable" }, // Gemini
  4: { element: "Water", elementGlyph: "🜄", cardinality: "Cardinal" }, // Cancer
  5: { element: "Fire", elementGlyph: "🜂", cardinality: "Fixed" }, // Leo
  6: { element: "Earth", elementGlyph: "🜃", cardinality: "Mutable" }, // Virgo
  7: { element: "Air", elementGlyph: "🜁", cardinality: "Cardinal" }, // Libra
  8: { element: "Water", elementGlyph: "🜄", cardinality: "Fixed" }, // Scorpio
  9: { element: "Fire", elementGlyph: "🜂", cardinality: "Mutable" }, // Sagittarius
  10: { element: "Earth", elementGlyph: "🜃", cardinality: "Cardinal" }, // Capricorn
  11: { element: "Air", elementGlyph: "🜁", cardinality: "Fixed" }, // Aquarius
  12: { element: "Water", elementGlyph: "🜄", cardinality: "Mutable" }, // Pisces
};

export const HOUSES: { [index: number]: HouseInfo } = {
  1: { number: 1, name: "Aries", abbreviation: "Ari", glyph: "♈︎︎" },
  2: { number: 2, name: "Taurus", abbreviation: "Tau", glyph: "♉︎︎" },
  3: { number: 3, name: "Gemini", abbreviation: "Gem", glyph: "♊︎︎" },
  4: { number: 4, name: "Cancer", abbreviation: "Can", glyph: "♋︎︎" },
  5: { number: 5, name: "Leo", abbreviation: "Leo", glyph: "♌︎︎" },
  6: { number: 6, name: "Virgo", abbreviation: "Vir", glyph: "♍︎︎" },
  7: { number: 7, name: "Libra", abbreviation: "Lib", glyph: "♎︎︎" },
  8: { number: 8, name: "Scorpio", abbreviation: "Sco", glyph: "♏︎︎" },
  9: { number: 9, name: "Sagittarius", abbreviation: "Sag", glyph: "♐︎︎" },
  10: { number: 10, name: "Capricorn", abbreviation: "Cap", glyph: "♑︎︎" },
  11: { number: 11, name: "Aquarius", abbreviation: "Aqu", glyph: "♒︎︎" },
  12: { number: 12, name: "Pisces", abbreviation: "Pis", glyph: "♓︎︎" },
  0: { number: 12, name: "Pisces", abbreviation: "Pis", glyph: "♓︎︎" },
};

export const HOUSE_NUMBER_LOOKUP: { [index: string]: number } = {
  ari: 1,
  tau: 2,
  gem: 3,
  can: 4,
  leo: 5,
  vir: 6,
  lib: 7,
  sco: 8,
  sag: 9,
  cap: 10,
  aqu: 11,
  pis: 12,
};

export type House = {
  number: number;
  name: string;
  abbreviation: string;
  glyph: string;
  position: { degrees: number; minutes: number };
};

export type BodyHousePosition = {
  currentHouse: number;
  house: House;
  decan: number;
  position: Position;
};

export type BodyHousePositions = {
  [K in Body]?: BodyHousePosition;
} & { cusps: number[] };

export function getHouseData(
  date: DateTime,
  location: [lon: number, lat: number],
  houseSystem: string = "W"
): any {
  const houseData = houses(
    toJulianDate(date),
    location[1],
    location[0],
    houseSystem
  );
  return houseData;
}

/**
 *
 * @param lookup The house decimal from the SWEPH `houses` function.
 * @returns
 */
export function houseDegreesMinutesZodiac(
  houseValue: number,
  cusps: number[]
): any {
  const currentHouse = Math.floor(houseValue);
  const cusp = cusps[Math.floor(houseValue) % 12]; // 0 indexed array.
  const house = { ...(HOUSES[Math.floor(cusp / 30)] || {}) };
  const deg = Math.floor((houseValue % 1) * 30);
  const min = Math.floor((((houseValue % 1) * 30) % 1) * 60);
  (house as House).position = {
    degrees: deg,
    minutes: min,
  };

  return {
    currentHouse,
    house,
    decan: deg < 10 ? 1 : deg < 20 ? 2 : 3,
  };
}

export function getBodiesHousePositions(
  date: DateTime,
  location: [lon: number, lat: number],
  bodies: string[],
  houseSystem: string = "W"
): BodyHousePositions {
  // Obtain house data for geo position
  let julianDate = toJulianDate(date);
  let houseData = getHouseData(date, location, houseSystem);
  let amrc = houseData.data.points[2];
  let asc = houseData.data.points[0]; // asc
  let mc = houseData.data.points[1]; // mc
  let cusps = houseData.data.houses;

  const planets = bodies.reduce((acc: any, bodyName: string) => {
    let bodyPosition: number[];

    if (bodyName === "asc") {
      bodyPosition = [asc, 0];
    } else if (bodyName === "mc") {
      bodyPosition = [mc, 0];
    } else {
      bodyPosition = calc_ut(
        julianDate,
        BODY_NAME_SWISS_EPH_CONST[bodyName],
        STANDARD_FLAGS
      ).data;
    }

    let hpresult = house_pos(amrc, location[1], OBLIQUITY, houseSystem, [
      bodyPosition[0], // lon
      bodyPosition[1], // lat
    ]);

    acc[bodyName] = {
      ...houseDegreesMinutesZodiac(hpresult.data, cusps),
      position: toDegMinSec(bodyPosition[0]),
    };

    return acc;
  }, {});

  // Calculate position of body.

  return { ...planets, cusps };
}

export function getBodyHousePosition(
  date: DateTime,
  location: [lon: number, lat: number],
  bodyName: Body,
  houseSystem: string = "W"
) {
  // Obtain house data for geo position
  let houseData = getHouseData(date, location, houseSystem);
  let amrc = houseData.data.points[2];
  let asc = houseData.data.points[0]; // asc
  let mc = houseData.data.points[1]; // mc
  let cusps = houseData.data.houses;

  // Calculate position of body.
  let bodyPosition: number[];
  if (bodyName === "asc") {
    bodyPosition = [asc, 0];
  } else if (bodyName === "mc") {
    bodyPosition = [mc, 0];
  } else {
    bodyPosition = getBodyPositionZodiacal(date, bodyName).data;
  }
  let hpresult = house_pos(amrc, location[1], OBLIQUITY, houseSystem, [
    bodyPosition[0], // lon
    bodyPosition[1], // lat
  ]);

  return {
    ...houseDegreesMinutesZodiac(hpresult.data, cusps),
    cusps: cusps,
    long: bodyPosition[0],
    lat: bodyPosition[1],
    // sweph: { houses: houseData },
  };
}

function getAnglePositionZodical(
  date: DateTime,
  location: [lon: number, lat: number],
  bodyName: string,
  houseSystem: string = "W"
): number[] | undefined {
  let houseData = getHouseData(date, location, houseSystem);
  let amrc = houseData.data.points[2];
  let asc = houseData.data.points[0]; // asc
  let mc = houseData.data.points[1]; // mc
  let cusps = houseData.data.houses;

  // Calculate position of body.
  let bodyPosition;
  if (bodyName === "asc") {
    bodyPosition = [asc, 0];
  } else if (bodyName === "mc") {
    bodyPosition = [mc, 0];
  } else {
    bodyPosition = undefined;
  }
  return bodyPosition;
}

/**
 *
 * Note: We're making a Whole Sign House assumption with this, for now.
 *
 * @param astroLoc An "astrological" location, for lack of a better word (known to me, PR? a fix?) like `12 Gem 15` or `10Tau06` or `8Pis3`.
 * @param cusps An array of cusps, 12 of them. In order where the 0th element is House 1 .. 11th being House 12. The value is the degrees from 0 to 330.
 */
export function astroLocationToDegrees(astroLoc: string) {
  let degSignMin = astroLoc.split(/([A-Za-z]+)/);
  let deg = parseInt(degSignMin[0].trim());
  let sign = degSignMin[1].toLowerCase();
  let house = HOUSE_NUMBER_LOOKUP[sign];
  let min = parseInt(degSignMin[2].trim());

  return ((house - 1) * 30 + deg + min / 60) % 360;
}
