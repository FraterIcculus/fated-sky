import { DateTime, Duration } from 'luxon';

const pr: Record<number, string> = {
  7: 'sun',
  1: 'moon',
  2: 'mars',
  3: 'mercury',
  4: 'jupiter',
  5: 'venus',
  6: 'saturn',
};

const pa = ['sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter', 'mars'];

const prName: Record<string, string> = {
  sun: 'Helios',
  moon: 'Selene',
  mars: 'Ares',
  mercury: 'Hermes',
  jupiter: 'Zeus',
  venus: 'Aphrodite',
  saturn: 'Kronos',
};

function get12PlanetaryHourSlices(start: string) {
  let pas = pa.concat(pa).concat(pa); // hack to provide enough array entries that repeat
  let dsp = pas.indexOf(start); // day start position (always the planetary ruler of the day)
  let nsp = pas.indexOf(pas[dsp + 12]);
  return { day: pas.slice(dsp, dsp + 12), night: pas.slice(nsp, nsp + 12) };
}

function phFilter(target: DateTime, pHour: any) {
  // console.log(`${pHour.start} >= ${target.toISO()} < ${pHour.end}`);
  return target >= pHour.start && target < pHour.end;
}

export function findHour(target: DateTime, planetaryHourDivisions: any) {
  let hour = planetaryHourDivisions.dayHours.filter((ph: any) =>
    phFilter(target, ph)
  );
  if (hour === undefined) {
    let hour = planetaryHourDivisions.nightHours.filter((ph: any) =>
      phFilter(target, ph)
    );
  }
  return hour[0];
}

export function daylightPlanetyHourDivision(
  rise: DateTime,
  set: DateTime,
  riseNextDay: DateTime
) {
  // Find the increment of minutes for the daytime hours
  let durationDay = set.diff(rise, ['minutes']);
  let minutesDay = durationDay.minutes;
  let minutesPerHourDay = minutesDay / 12;
  let perHourDurationDay = Duration.fromObject({
    minutes: minutesPerHourDay,
  });

  // Find the increment of minutes for the night time hours
  let durationNight = riseNextDay.diff(set, ['minutes']);
  let minutesNight = durationNight.minutes;
  let minutesPerHourNight = minutesNight / 12;
  let perHourDurationNight = Duration.fromObject({
    minutes: minutesPerHourNight,
  });

  let ruler = pr[parseInt(rise.toFormat('E'))];
  let { day, night } = get12PlanetaryHourSlices(ruler);

  let dayHours = get12PlanetaryHourSlices(ruler).day.reduce(
    (res: any, hour: string) => {
      let prev = res[res.length - 1];
      let start = prev == null ? rise : prev.start.plus(perHourDurationDay);
      res.push({
        ruler: hour,
        hour: res.length + 1,
        start: start,
        end: start.plus(perHourDurationDay),
      });

      return res;
    },
    []
  );

  let nightHours = get12PlanetaryHourSlices(ruler).night.reduce(
    (res: any, hour: string) => {
      let prev = res[res.length - 1];
      let start =
        prev == null
          ? dayHours[dayHours.length - 1].end // Start with the end of the day hours
          : prev.start.plus(perHourDurationNight);
      res.push({
        ruler: hour,
        hour: res.length + 13,
        start: start,
        end: start.plus(perHourDurationNight),
      });

      return res;
    },
    []
  );

  return {
    dayHours: dayHours,
    nightHours: nightHours,
    rise: rise,
    set: set,
    ruler: ruler,
    mphDay: minutesPerHourDay,
    mphNight: minutesPerHourNight,
    dh: day,
    nh: night,
  };
}

export function planetaryHoursToString(phd: any) {
  const currentSystemTimezone = DateTime.local().zoneName;
  let dh = phd.dayHours.reduce((res: any, val: any) => {
    return (
      res +
      `${val.hour} ${val.ruler}: ${val.start
        .setZone(currentSystemTimezone)
        .toFormat('HH:mm:ss')} to ${val.end
        .setZone(currentSystemTimezone)
        .toFormat('HH:mm:ss')}\n`
    );
  }, 'Day Hours \n');
  let nh = phd.nightHours.reduce((res: any, val: any) => {
    return (
      res +
      `${val.hour} ${val.ruler}: ${val.start
        .setZone(currentSystemTimezone)
        .toFormat('HH:mm:ss')} to ${val.end
        .setZone(currentSystemTimezone)
        .toFormat('HH:mm:ss')}\n`
    );
  }, 'Night Hours \n');

  return `The ruler of ${phd.rise.toFormat('EEEE')} is ${phd.ruler} (${
    prName[phd.ruler]
  })\n\n${dh}\n${nh}`;
}
