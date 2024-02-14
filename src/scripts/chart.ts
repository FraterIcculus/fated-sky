#!/usr/bin/env node
import {
  BodyHousePosition,
  BodyHousePositions,
  ZODIAC_INFO,
  getBodiesHousePositions,
} from "../houses";
import {
  BODY_GLYPHS,
  Body,
  PLANET_DIGNITIES,
  STANDARD_11,
} from "../bodies";
import ansis from "ansis";
import { DECAN_RULER_LOOKUP } from "../decans";
import {
  ASPECT_GLYPHS,
  COLORED_ASPECT_GLYPHS,
  aspectsForBodies,
  multiBodyAspectSearch,
} from "../aspects";
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
      formatBodyPos(bps[name]) +
      (idx + 1 < names.length ? " . " : "")
    );
  }, "");
}

//
const big3 = ["asc", "sun", "moon"] as Body[];
const std5 = ["mercury", "venus", "mars", "jupiter", "saturn"] as Body[];
const out3 = ["uranus", "neptune", "pluto"] as Body[];

console.log(
  formatBodyPositions(big3, bodyPositions) +
    ansis.blackBright` - [ ${ansis.whiteBright(
      options.time.toFormat("yyyy-MM-dd HH:mm:ss")
    )} ]`
);
console.log(formatBodyPositions(std5, bodyPositions));
console.log(formatBodyPositions(out3, bodyPositions));
