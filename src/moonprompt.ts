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
import { program } from 'commander';


sweph.set_ephe_path("./ephe");

program
    .option('-l, --locations <file>', 'A path to a locations JSON')
    .option('-n, --name <name>', 'The location key name to use')
    .option('-g, --geo <long,lat>', 'Geographic location: long,lat')
    .parse(process.argv);

const options = program.opts();

let position:[number,number];

if (options.geo) {
  position = (options.geo as string).split(',').map(s => parseFloat(s.trim())) as [number, number];
} else if (options.locations && options.name) {
  const positions: Record<string, [number, number, number]> = JSON.parse(
    // This expects a file to contain records like:
    // { "some-name": [-86.157328, 39.779955, 750], ...}
    readFileSync(options.locations, { encoding: "utf8", flag: "r" })
  );  
  position = positions[options.name].slice(0, -1) as [number, number];
} else {
  console.error('Error: you must provide either --geo, or --locations & --name.');
  process.exit(1);
}

const moon = getBodiesHousePositions(
  DateTime.now(),
  position,
  ["moon"]
);
const mansion = getMansionFromPosition(moon.moon.position);
const moonPhase = moonInfo(DateTime.now());

// console.dir(moon);
// console.dir(moonPhase);
// console.dir(mansion);

const currentMoonPosition = moon.moon.position.raw;
const houseStart = Math.trunc(currentMoonPosition / 30) * 30;

const locDt = findTimeForLocation(
  "moon",
  DateTime.now(),
  DateTime.now().plus({ days: 60 }),
  houseStart + 30,
  false
);
//console.dir(locDt);

const moon2 = getBodiesHousePositions(
  locDt as DateTime,
  position,
  ["moon"]
);
// console.dir(moon2);

const moonPhase2 = moonInfo(locDt as DateTime);

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
    `${moon.moon.house.abbreviation.toLowerCase()}${moon.moon.decan}`
  ];

if (decanRuler === 'Moon') {
  decanRuler = `${ansis.whiteBright(decanRuler)}`
}

const line1 = `${moonPhase.phaseEmoji} @ ${ansis.whiteBright(
  percentify(moonPhase.lumination).toString()
)}% ${ansis.blackBright("lum")} ${
  moonPhase.waxing ? ansis.blueBright("↑") : ansis.blue("↓")
} in decan ${moon.moon.decan} of ${moon.moon.house.glyph}[${getDignityCode(
  moon.moon.house.number
)}] ${getSignElement(moon.moon.house.number)}`;
const line4 = `        ${ansis.blackBright(".")}${ansis.white(
  "o"
)}${ansis.whiteBright("(")} ${moon.moon.house.name} ${
  moon.moon.decan
} ruled by ${decanRuler} ${ansis.whiteBright(")")}${ansis.white(
  "o"
)}${ansis.blackBright(".")}`;
const line2 = `${moonPhase.phaseEmoji} in Mansion ${mansion.mansion}: ${mansion.name} : ${mansion.meaning}`;
const line3 = `${moonPhase2.phaseEmoji} → ${
  moon2.moon.house.glyph
}[${getDignityCode(moon2.moon.house.number)}]  ${getSignElement(
  moon2.moon.house.number
)} @ ${locDt}`;

console.log(line2);
console.log(line1);
console.log(line4);
console.log(line3);
