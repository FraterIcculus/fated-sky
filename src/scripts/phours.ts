import { DateTime } from "luxon";
import {
  daylightPlanetyHourDivision,
  planetaryHoursToString,
} from "../planetary-hours";
import { riseTimeSun, setTimeSun } from "../bodies";
import { program, options } from "../abstractions/cmd";

program
  .name("phours")
  .description("CLI to generate Planetary Hours information")
  .version("0.1.0");

function run(date: DateTime, location: [number, number, number]) {
  const rt = riseTimeSun(date, location);
  const st = setTimeSun(date, location);
  const rtn = riseTimeSun(date.plus({ days: 1 }), location);
  let phd = daylightPlanetyHourDivision(rt, st, rtn);
  console.log(planetaryHoursToString(phd));
}

run(options.date, options.position);
