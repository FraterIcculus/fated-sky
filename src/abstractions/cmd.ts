import { program } from "commander";
import { readFileSync } from "fs";
import { DateTime } from "luxon";
import sweph from "sweph";
export { program } from "commander";

program
  .option("-l, --locations <file>", "A path to a locations JSON")
  .option("-n, --name <name>", "The location key name to use")
  .option(
    "-g, --geo <long,lat, optional alt.>",
    "Geographic location: long,lat or long,lat,alt"
  )
  .option("-e, --ephe <filepath>", "The path to the Swiss Ephemeris data files")
  .option(
    "-d, --date <date>",
    "Show the Planetary Hours for the given date. YYYY-MM-DD"
  )
  .option("-t, --time <datetime>", "ISO-8601 Format, YYYY-MM-DDTHH:MM:SS")
  .parse(process.argv);

export const options = program.opts();

if (options.geo) {
  options.position = (options.geo as string)
    .split(",")
    .map((s) => parseFloat(s.trim())) as [number, number, number | undefined];
  if (options.position[2] === undefined) {
    options.position[2] = 0;
  }
} else if (options.locations && options.name) {
  const positions: Record<string, [number, number, number]> = JSON.parse(
    readFileSync(options.locations, { encoding: "utf8", flag: "r" })
  );
  options.position = positions[options.name];
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
  options.date = DateTime.fromISO(options.date).toLocal().startOf("day");
} else {
  options.date = DateTime.local().startOf("day");
}

if (options.time) {
  options.time = DateTime.fromISO(options.time);
} else {
  options.time = DateTime.now();
}
