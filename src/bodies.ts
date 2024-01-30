import { constants, rise_trans_true_hor, pheno, calc_ut } from "sweph";
import { DateTime } from "luxon";
import { toJulianDate, toLuxonDateUTC } from "./dates";
import {
  BODY_NAME_SWISS_EPH_CONST,
  PLANET_SPEED_DAILY,
  STANDARD_FLAGS,
} from "./common";

export type Body =
  | "asc"
  | "mc"
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "chiron";

export type PlanetDignities = {
  rulership: number[];
  exaltation: number[];
  detriment: number[];
  fall: number[];
};

export const PLANET_DIGNITIES: { [planet: string]: PlanetDignities } = {
  sun: {
      rulership: [5], // Leo
      exaltation: [1], // Aries
      detriment: [11], // Aquarius
      fall: [7] // Libra
  },
  moon: {
      rulership: [4], // Cancer
      exaltation: [2], // Taurus
      detriment: [10], // Capricorn
      fall: [8] // Scorpio
  },
  mercury: {
      rulership: [3, 6], // Gemini, Virgo
      exaltation: [],
      detriment: [9, 12], // Sagittarius, Pisces
      fall: []
  },
  venus: {
      rulership: [2, 7], // Taurus, Libra
      exaltation: [12], // Pisces
      detriment: [8, 1], // Scorpio, Aries
      fall: [6] // Virgo
  },
  mars: {
      rulership: [1, 8], // Aries, Scorpio
      exaltation: [10], // Capricorn
      detriment: [7, 2], // Libra, Taurus
      fall: [4] // Cancer
  },
  jupiter: {
      rulership: [9, 12], // Sagittarius, Pisces
      exaltation: [4], // Cancer
      detriment: [3, 6], // Gemini, Virgo
      fall: [10] // Capricorn
  },
  saturn: {
      rulership: [10, 11], // Capricorn, Aquarius
      exaltation: [7], // Libra
      detriment: [4, 5], // Cancer, Leo
      fall: [1] // Aries
  }
};


/**
 * ### Description
 * Wraps `sweph.rise_trans_true_hor`, which:
 * Compute the times of rising, setting and meridian transits for all planets, asteroids, the moon, and the fixed stars
 * This function also supports custom local horizon altitude
 * ### Params
 * ```
 * • obj: number         // Object ID, see: sweph.constants, e.g. SE_SUN, SE_MOON, etc.
 * • transitType: number // Transit type (SE_CALC_RISE, SE_CALC_SET, SE_CALC_MTRANSIT, SE_CALC_ITRANSIT) plus additional transit flags
 * • date: DateTime
 * • latLongAlt: [number,number,number] // Geographic coordinates of the observer [longitude, latitude, elevation]
 * ```
 * ### Returns
 * ```
 * data: number // Transit time in julian days in universal time
 * ```
 *
 * &nbsp;
 */
function transitTime(
  obj: number,
  transitType: number,
  date: DateTime,
  latLongAlt: [number, number, number]
) {
  let rt = rise_trans_true_hor(
    toJulianDate(date),
    obj,
    null,
    constants.SEFLG_SWIEPH,
    transitType,
    latLongAlt,
    0,
    0,
    0
  );
  return rt.data;
}

export function riseTimeSun(
  date: DateTime,
  latLongAlt: [number, number, number]
) {
  return toLuxonDateUTC(
    transitTime(
      constants.SE_SUN,
      constants.SE_CALC_RISE,
      date.startOf("day"),
      latLongAlt
    )
  );
}

export function setTimeSun(
  date: DateTime,
  latLongAlt: [number, number, number]
) {
  return toLuxonDateUTC(
    transitTime(
      constants.SE_SUN,
      constants.SE_CALC_SET,
      date.startOf("day"),
      latLongAlt
    )
  );
}

// 🌑 New Moon Symbol (:new_moon:)
// 🌒 Waxing Crescent Moon Symbol (:waxing_crescent_moon:)
// 🌓 First Quarter Moon Symbol (:first_quarter_moon:)
// 🌔 Waxing Gibbous Moon Symbol (:waxing_gibbous_moon:)
// 🌕 Full Moon Symbol (:full_moon:)
// 🌖 Waning Gibbous Moon Symbol (:waning_gibbous_moon:)
// 🌗 Last Quarter Moon Symbol (:last_quarter_moon:)
// 🌘 Waning Crescent Moon Symbol (:waning_crescent_moon:)

function moonPhaseString(phase: number, waxing: boolean) {
  if (phase >= 0 && phase < 0.01) {
    return ["new", "🌑"];
  } else if (phase >= 0.01 && phase < 0.45) {
    return ["crescent", waxing ? "🌒" : "🌘"];
  } else if (phase >= 0.45 && phase < 0.55) {
    return waxing ? ["first quarter", "🌓"] : ["third quarter", "🌗"];
  } else if (phase >= 0.55 && phase < 0.99) {
    return ["gibbous", waxing ? "🌔" : "🌖"];
  } else if (phase >= 0.99) {
    return ["full", "🌕"];
  } else {
    return ["unknown", ""];
  }
}

export type MoonPhase = {
  lumination: number;
  phaseName: string;
  phaseEmoji: string;
  waxing: boolean;
  waning: boolean;
};

export function moonInfo(date: DateTime): MoonPhase {
  let mpPrev = pheno(
    toJulianDate(date.minus({ days: 1 })),
    constants.SE_MOON,
    constants.SEFLG_SWIEPH
  );
  let mp = pheno(toJulianDate(date), constants.SE_MOON, constants.SEFLG_SWIEPH);
  let waxing = mp.data[1] > mpPrev.data[1] ? true : false;
  const mps = moonPhaseString(mp.data[1], waxing);
  return {
    lumination: mp.data[1],
    phaseName: mps[0],
    phaseEmoji: mps[1],
    waxing: waxing,
    waning: !waxing,
  };
}

export function getBodyPositionZodiacal(start: DateTime, bodyName: Body): any {
  let bodyPosition = calc_ut(
    toJulianDate(start),
    BODY_NAME_SWISS_EPH_CONST[bodyName],
    STANDARD_FLAGS
  );

  return bodyPosition;
}

export function findTimeForLocation(
  bodyName: Body,
  start: DateTime,
  end: DateTime,
  targetDegrees: number,
  backwardsInTime: boolean,
  tolerance: number = 0.5,
  maxCycles: number = 200,
  cycle: number = 1
): DateTime | undefined {
  // Calculate position of body.
  let bodyPosition = getBodyPositionZodiacal(start, bodyName);
  const bLon = bodyPosition?.data[0];
  // Can be negative.
  const degreesToTarget = targetDegrees - bLon;
  const degreesFromTarget = bLon - targetDegrees;

  // How many degrees around the circle do we need to go to hit our target
  const fwdDegreesToTarget =
    bLon <= targetDegrees ? degreesToTarget : 360 + degreesToTarget;
  const bkwDegreesToTarget =
    bLon >= targetDegrees ? degreesFromTarget : 360 + degreesFromTarget;

  if (
    (fwdDegreesToTarget <= tolerance && bLon >= targetDegrees) ||
    (bkwDegreesToTarget <= tolerance && bLon >= targetDegrees) ||
    cycle >= maxCycles
  ) {
    console.log(
      `(cyc: ${cycle})Target location ${bLon}, target ${targetDegrees} on date ${start}`
    );
    return start;
  }

  // Which search time directon are we doing? If the caller is okay with backwards and thats shorter, we use it.
  const searchDirectionFwd =
    backwardsInTime && Math.abs(degreesToTarget) < fwdDegreesToTarget
      ? false
      : true;

  let bodyDailyTravelDegrees = PLANET_SPEED_DAILY[bodyName].max;

  // Heuristic backoff to allow less jumpiness when searching.
  // 12 and 7 come from guess and check.
  // 6 and 3 come from guess and check.
  if (cycle > 12) {
    bodyDailyTravelDegrees = bodyDailyTravelDegrees * 6;
  } else if (cycle > 7) {
    bodyDailyTravelDegrees = bodyDailyTravelDegrees * 3;
  }
  const daysToTarget = searchDirectionFwd
    ? fwdDegreesToTarget / bodyDailyTravelDegrees
    : degreesToTarget / bodyDailyTravelDegrees;

  // console.log(
  //   `${cycle} ${searchDirectionFwd} - Days away: ${daysToTarget} :: ${degreesToTarget}° ${start}`
  // );

  const enoughDaysInSearch = end >= start.plus({ days: daysToTarget });

  if (enoughDaysInSearch) {
    return findTimeForLocation(
      bodyName,
      start.plus({ days: daysToTarget }),
      end,
      targetDegrees,
      true,
      tolerance,
      maxCycles,
      cycle + 1
    );
  } else {
    return undefined;
  }
}
