#!/usr/bin/env node
import {
  BodyHousePosition,
  BodyHousePositions,
  ZODIAC_INFO,
  getBodiesHousePositions,
} from "../houses";
import { BODY_GLYPHS, Body, STANDARD_11 } from "../bodies";
import ansis from "ansis";
import { COLORED_ASPECT_GLYPHS, aspectsForBodies } from "../aspects";
import { options } from "../abstractions/cmd";

const currentSystemTimezone = options.time.toLocal().zoneName;

// the current house Moon.
const bodyPositions = getBodiesHousePositions(
  options.time,
  options.position,
  STANDARD_11
);

function signColorFunction(house: number) {
  const hzi = ZODIAC_INFO[house];
  switch (hzi.element) {
    case "Fire":
      return ansis.redBright;
    case "Water":
      return ansis.blueBright;
    case "Air":
      return ansis.yellowBright;
    case "Earth":
      return ansis.greenBright;
    default:
      return ansis.white;
  }
}

function formatBodyPos(body: BodyHousePosition) {
  return ansis.whiteBright(
    `${body.house.position.degrees
      .toString()
      .padStart(2, "0")}${signColorFunction(body.house.number)(
      body.house.abbreviation
    )}${body.house.position.minutes.toString().padStart(2, "0")}`
  );
}

function formatBody(bodyName: string) {
  const glyph = BODY_GLYPHS[bodyName];
  return glyph;
}

function formatBodyPositions(names: Body[], bps: BodyHousePositions) {
  return names.reduce((acc, name, idx) => {
    return (
      acc +
      formatBody(name) +
      " " +
      formatBodyPos(bps[name]!) +
      (idx + 1 < names.length ? " . " : "")
    );
  }, "");
}

//
const big3 = ["asc", "sun", "moon"] as Body[];
const std5 = ["mercury", "venus", "mars", "jupiter", "saturn"] as Body[];
const out3 = ["uranus", "neptune", "pluto"] as Body[];
const aspectBodies = big3.slice(1).concat(std5, out3);

console.log(
  ansis.blackBright`[ ${ansis.cyanBright(
    options.time.toFormat("yyyy-MM-dd HH:mm:ss")
  )} ] ` + formatBodyPositions(big3, bodyPositions)
);
console.log(formatBodyPositions(std5, bodyPositions));
console.log(formatBodyPositions(out3, bodyPositions));

const { asc, ...bpNoAsc } = bodyPositions;
const aspects = aspectsForBodies(bpNoAsc);

const aspected = new Set();
let counter = 0;
const aspectString = aspectBodies.reduce((acc: string, bodyName) => {
  return (
    acc +
    Object.entries(aspects[bodyName])
      .filter(([_, value]) => value?.aspect !== undefined)
      .reduce((asp, cur) => {
        const keyF = `${bodyName}_${cur[0]}`;
        const keyR = `${cur[0]}_${bodyName}`;
        // console.log(`key: ${keyF} / ${keyR}`);
        if (aspected.has(keyF) || aspected.has(keyR)) {
          return asp;
        } else {
          aspected.add(keyF);
          aspected.add(keyR);
          counter = counter + 1;
          return (
            asp +
            `${BODY_GLYPHS[bodyName]} ${COLORED_ASPECT_GLYPHS[cur[1].aspect]} ${
              BODY_GLYPHS[cur[0]]
            }   ` +
            (counter % 7 === 0 ? "\n" : "")
          );
        }
      }, "")
  );
}, "");

console.log(aspectString);
