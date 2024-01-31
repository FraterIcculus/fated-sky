import sweph from 'sweph';
import { DateTime } from 'luxon';
import {
  daylightPlanetyHourDivision,
  planetaryHoursToString,
} from './planetary-hours';
import { riseTimeSun, setTimeSun } from './bodies';
import { Command } from 'commander';
import { readFileSync } from 'fs';

const program = new Command();

program
  .name('phours')
  .description('CLI to generate Planetary Hours information')
  .version('0.1.0');

program
  .option("-l, --locations <file>", "A path to a locations JSON")
  .option("-n, --name <name>", "The location key name to use")
  .option("-g, --geo <long,lat>", "Geographic location: long,lat")
  .option("-e, --ephe <filepath>", "The path to the Swiss Ephemeris data files")
  .option("-d, --date <date>", "Show the Planetary Hours for the given date. YYYY-MM-DD")
  .parse(process.argv);

const options = program.opts();

let position: [number, number, number];

if (options.geo) {
  position = ((options.geo as string) + ',100')
    .split(",")
    .map((s) => parseFloat(s.trim())) as [number, number, number];
} else if (options.locations && options.name) {
  const positions: Record<string, [number, number, number]> = JSON.parse(
    readFileSync(options.locations, { encoding: "utf8", flag: "r" })
  );
  position = positions[options.name];
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

if (options.date) {
  options.date = DateTime.fromISO(options.date).toLocal();
} else {
  options.date = DateTime.local().startOf('day');
}


function run(date: DateTime, location: [number, number, number]) {
  const rt = riseTimeSun(date, location);
  const st = setTimeSun(date, location);
  const rtn = riseTimeSun(date.plus({ days: 1 }), location);
  let phd = daylightPlanetyHourDivision(rt, st, rtn);
  console.log(planetaryHoursToString(phd));
}


run(options.date, position);
