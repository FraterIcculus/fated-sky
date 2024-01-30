#!/usr/bin/env node
import sweph from "sweph";
import { ZODIAC_INFO, getBodiesHousePositions } from "./houses";
import { DateTime } from "luxon";
import { readFileSync } from "fs";
import { getMansionFromPosition } from "./mansions";
import { PLANET_DIGNITIES, findTimeForLocation, moonInfo } from "./bodies";
import { percentify } from "./common";
import ansis from "ansis";
import { DECAN_RULER_LOOKUP } from "./decans";
import { program } from "commander";

program
  .option("-l, --locations <file>", "A path to a locations JSON")
  .option("-n, --name <name>", "The location key name to use")
  .option("-g, --geo <long,lat>", "Geographic location: long,lat")
  .option("-e, --ephe <filepath>", "The path to the Swiss Ephemeris data files")
  .parse(process.argv);

const options = program.opts();

let position: [number, number];

if (options.geo) {
  position = (options.geo as string)
    .split(",")
    .map((s) => parseFloat(s.trim())) as [number, number];
} else if (options.locations && options.name) {
  const positions: Record<string, [number, number, number]> = JSON.parse(
    readFileSync(options.locations, { encoding: "utf8", flag: "r" })
  );
  position = positions[options.name].slice(0, -1) as [number, number];
} else {
  console.error(
    "Error: you must provide either --geo, or --locations & --name."
  );
  process.exit(1);
}

if (options.ephe) {
  sweph.set_ephe_path(options.ephe);
} else {
  console.error(
    "Error: You must provide a path to Swiss Ephemeris data files."
  );
  process.exit(1);
}

// the current house Moon.
const chMoon = getBodiesHousePositions(DateTime.now(), position, ["moon"]);
const mansion = getMansionFromPosition(chMoon.moon.position);
const moonPhase = moonInfo(DateTime.now());

// console.dir(moon);
// console.dir(moonPhase);
// console.dir(mansion);

const currentMoonPosition = chMoon.moon.position.raw;
const houseStart = Math.trunc(currentMoonPosition / 30) * 30;

const moonInNextHouseDT = findTimeForLocation(
  "moon",
  DateTime.now(),
  DateTime.now().plus({ days: 60 }),
  houseStart + 30,
  false
);
//console.dir(locDt);

// the moon, when it's in the next house.
const nhMoon = getBodiesHousePositions(moonInNextHouseDT as DateTime, position, ["moon"]);
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
    `${chMoon.moon.house.abbreviation.toLowerCase()}${chMoon.moon.decan}`
  ];

if (decanRuler === "Moon") {
  decanRuler = `${ansis.whiteBright(decanRuler)}`;
}

const line1 = `${moonPhase.phaseEmoji} @ ${ansis.whiteBright(
  percentify(moonPhase.lumination).toString()
)}% ${ansis.blackBright("lum")} ${
  moonPhase.waxing ? ansis.blueBright("↑") : ansis.blue("↓")
} in decan ${chMoon.moon.decan} of ${chMoon.moon.house.glyph}[${getDignityCode(
  chMoon.moon.house.number
)}] ${getSignElement(chMoon.moon.house.number)}`;
const line4 = `        ${ansis.blackBright(".")}${ansis.white(
  "o"
)}${ansis.whiteBright("(")} ${chMoon.moon.house.name} ${
  chMoon.moon.decan
} ruled by ${decanRuler} ${ansis.whiteBright(")")}${ansis.white(
  "o"
)}${ansis.blackBright(".")}`;
const line2 = `${moonPhase.phaseEmoji} in Mansion ${mansion.mansion}: ${mansion.name} : ${mansion.meaning}`;
const line3 = `${moonPhase2.phaseEmoji} → ${
  nhMoon.moon.house.glyph
}[${getDignityCode(nhMoon.moon.house.number)}]  ${getSignElement(
  nhMoon.moon.house.number
)} @ ${moonInNextHouseDT}`;

console.log(line2);
console.log(line1);
console.log(line4);
console.log(line3);
