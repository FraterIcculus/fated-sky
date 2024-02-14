#!/usr/bin/env node
import { ZODIAC_INFO, getBodiesHousePositions } from "../houses";
import { DateTime } from "luxon";
import { getMansionFromPosition } from "../mansions";
import {
  BODY_GLYPHS,
  PLANET_DIGNITIES,
  TRADITIONAL_7,
  findTimeForLocation,
  moonInfo,
  riseTimeSun,
  setTimeSun,
} from "../bodies";
import { percentify } from "../common";
import ansis from "ansis";
import { DECAN_RULER_LOOKUP } from "../decans";
import {
  ASPECT_GLYPHS,
  COLORED_ASPECT_GLYPHS,
  aspectsForBodies,
  multiBodyAspectSearch,
} from "../aspects";
import { daylightPlanetyHourDivision } from "../planetary-hours";
import { options } from "../abstractions/cmd";

const position = options.position;

const runTime = DateTime.now();
const currentSystemTimezone = runTime.toLocal().zoneName;

// the current house Moon.
const chMoon = getBodiesHousePositions(runTime, position, TRADITIONAL_7);
const mansion = getMansionFromPosition(chMoon.moon!.position);
const moonPhase = moonInfo(runTime);

// console.dir(moon);
// console.dir(moonPhase);
// console.dir(mansion);

const currentMoonPosition = chMoon.moon!.position.raw;
const houseStart = Math.trunc(currentMoonPosition / 30) * 30;

const moonInNextHouseDT = findTimeForLocation(
  "moon",
  runTime,
  runTime.plus({ days: 60 }),
  houseStart + 30,
  false
);

// the moon, when it's in the next house.
const nhMoon = getBodiesHousePositions(
  moonInNextHouseDT as DateTime,
  position,
  ["moon"]
);
// console.dir(moon2);

const moonPhase2 = moonInfo(moonInNextHouseDT as DateTime);

const dignity = PLANET_DIGNITIES.moon;

function getDignityCode(house: number) {
  let dignityCode = `${ansis.blackBright("-")}`;
  if (dignity.detriment.includes(house)) {
    dignityCode = `${ansis.green("d")}`;
  } else if (dignity.exaltation.includes(house)) {
    dignityCode = `${ansis.greenBright("E")}`;
  } else if (dignity.fall.includes(house)) {
    dignityCode = `${ansis.blue("f")}`;
  } else if (dignity.rulership.includes(house)) {
    dignityCode = `${ansis.blueBright("R")}`;
  }
  return dignityCode;
}

function getSignElement(house: number) {
  let ec = "";
  let zi = ZODIAC_INFO[house];
  if (zi.element === "Fire") {
    ec = `${ansis.redBright(zi.elementGlyph)}`;
  } else if (zi.element === "Water") {
    ec = `${ansis.blueBright(zi.elementGlyph)}`;
  } else if (zi.element === "Earth") {
    ec = `${ansis.greenBright(zi.elementGlyph)}`;
  } else if (zi.element === "Air") {
    ec = `${ansis.yellowBright(zi.elementGlyph)}`;
  }

  return `${zi.cardinality} ${ec}`;
}

let decanRuler =
  DECAN_RULER_LOOKUP[
    `${chMoon.moon!.house.abbreviation.toLowerCase()}${chMoon.moon!.decan}`
  ];

if (decanRuler === "Moon") {
  decanRuler = `${ansis.whiteBright(decanRuler)}`;
}

const line1 =
  "" +
  moonPhase.phaseEmoji +
  " @ " +
  ansis.whiteBright(percentify(moonPhase.lumination).toString()) +
  "% " +
  ansis.blackBright("lum ") +
  (moonPhase.waxing ? ansis.blueBright("↑") : ansis.blue("↓")) +
  " in decan " +
  chMoon.moon!.decan +
  " of " +
  chMoon.moon!.house.glyph +
  "[" +
  getDignityCode(chMoon.moon!.house.number) +
  "]" +
  getSignElement(chMoon.moon!.house.number);

const line4 =
  ansis.blackBright(".") +
  ansis.white("o") +
  ansis.whiteBright("(") +
  `${chMoon.moon!.house.name} ${chMoon.moon!.decan}` +
  ` ruled by ${decanRuler}` +
  ansis.whiteBright(")") +
  ansis.white("o") +
  ansis.blackBright(".");

const line2 = `${moonPhase.phaseEmoji} in Mansion ${mansion.mansion}: ${mansion.name} : ${mansion.meaning}`;

const line3 = `${moonPhase2.phaseEmoji} → ${
  nhMoon.moon!.house.glyph
}[${getDignityCode(nhMoon.moon!.house.number)}]  ${getSignElement(
  nhMoon.moon!.house.number
)} @ ${moonInNextHouseDT}`;

console.log(line2);
console.log(line1);
console.log("       " + line4);
console.log(line3);

console.log(
  "   Aspects: " +
    Object.entries(aspectsForBodies(chMoon).moon)
      .filter(([_, value]) => value?.aspect !== undefined)
      .reduce((acc, cur) => {
        return (
          acc +
          `${BODY_GLYPHS["moon"]} ${COLORED_ASPECT_GLYPHS[cur[1].aspect]} ${
            BODY_GLYPHS[cur[0]]
          }   `
        );
      }, "")
);

// filter((asp) => asp?.aspect !== undefined));

function findMoonHours(phd: any) {
  const dh = phd.dayHours;
  const nh = phd.nightHours;
  const dayMoons = dh.filter((h: { ruler: string }) => h.ruler === "moon");
  const nightMoons = nh.filter((h: { ruler: string }) => h.ruler === "moon");
  return { ruler: phd.ruler, dayMoons, nightMoons };
}

function timeColorFn(start: DateTime, end: DateTime, cmp: DateTime) {
  if (cmp >= start && cmp <= end) {
    // during
    return ansis.whiteBright;
  } else if (cmp > end) {
    // after
    return ansis.blackBright;
  } else if (cmp < start) {
    // before
    return ansis.white;
  }
  return ansis.white;
}

function moonHoursString(mdata: any) {
  let firstMh = false;
  let nextMh = false;
  let mhs =
    "   Planetary Ruler of Today: " +
    ansis.blackBright("[ ") +
    BODY_GLYPHS[mdata.ruler] +
    ansis.blackBright(" ]") +
    mdata.dayMoons.reduce((acc: string, cur: any) => {
      nextMh = !firstMh && runTime <= cur.end;
      if (nextMh) {
        firstMh = true;
      }
      return timeColorFn(
        cur.start,
        cur.end,
        runTime
      )(
        acc +
          `\n   ${
            nextMh ? ansis.whiteBright("→ ") : "  "
          }Day Hour of the Moon` +
          `(${cur.hour}): ` +
          `${cur.start
            .setZone(currentSystemTimezone)
            .toFormat("HH:mm:ss")} to ${cur.end
            .setZone(currentSystemTimezone)
            .toFormat("HH:mm:ss")}`
      );
    }, "") +
    mdata.nightMoons.reduce((acc: string, cur: any) => {
      nextMh = !firstMh && runTime <= cur.end;
      if (nextMh) {
        firstMh = true;
      }
      return timeColorFn(
        cur.start,
        cur.end,
        runTime
      )(
        acc +
          `\n   ${
            nextMh ? ansis.whiteBright("→ ") : "  "
          }Night Hour of the Moon` +
          `(${cur.hour}): ` +
          `${cur.start
            .setZone(currentSystemTimezone)
            .toFormat("HH:mm:ss")} to ${cur.end
            .setZone(currentSystemTimezone)
            .toFormat("HH:mm:ss")}`
      );
    }, "");

  return mhs;
}

const date = runTime.toLocal().startOf("day");
const rt = riseTimeSun(date, position);
const st = setTimeSun(date, position);
const rtn = riseTimeSun(date.plus({ days: 1 }), position);
let phd = daylightPlanetyHourDivision(rt, st, rtn);
// console.log(findMoonHours(phd));
console.log(moonHoursString(findMoonHours(phd)));
console.log(
  "     Current Time: " +
    runTime.setZone(currentSystemTimezone).toFormat("HH:mm:ss")
);
