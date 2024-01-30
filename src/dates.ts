import { DateTime, Duration } from 'luxon';
import sweph from 'sweph';

export function julianDateNow():number {
    return toJulianDate(DateTime.now());
}

export function toJulianDate(dt:DateTime): number {
    let dtUTC = dt.toUTC();
    let hourFrac = dtUTC.hour + dtUTC.minute / 60 + dtUTC.second / 60 / 60;
    let jd = sweph.julday(
        dtUTC.year,
        dtUTC.month,
        dtUTC.day,
        hourFrac,
        sweph.constants.SE_GREG_CAL
    );
    return jd;
}

export function toLuxonDateUTC(jd:number):DateTime {
    let sdate = sweph.jdut1_to_utc(jd, sweph.constants.SE_GREG_CAL);
    return DateTime.utc(
        sdate.year,
        sdate.month,
        sdate.day,
        sdate.hour,
        sdate.minute,
        Math.floor(sdate.second),
        Math.floor(1000 * (sdate.second - Math.floor(sdate.second)))
    );
}

export function toLuxonDateZoned(jd:number, zone:string):DateTime {
    return toLuxonDateUTC(jd).setZone(zone);
}
