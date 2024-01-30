/**
 * Decans ingresses are caluclated by looking at when the sun first returns to a given position in the zodiac.
 * Each decan is 10° of the given sign.
 *
 * Compare against:
 * https://horoscopes.astro-seek.com/calculate-planet-ingresses-and-particular-degree-returns/?planeta_navrat_en=sun&znameni_stupen=0&znameni_minuta=0&znameni_sekunda=0&znameni_navrat_en=aquarius&ingres_narozeni_rok=2023&aya=
 *
 * https://en.wikipedia.org/wiki/Astrological_symbols
 *
 * https://en.wikipedia.org/wiki/Decan_(astrology)
 *
 */

// https://en.wikipedia.org/wiki/Decan_(astrology)#Traditional_Chaldean_rulerships
export const DECAN_RULER_LOOKUP: { [abbreviation: string]: string } = {
    ari1: 'Mars',
    ari2: 'Sun',
    ari3: 'Venus',
    tau1: 'Mercury',
    tau2: 'Moon',
    tau3: 'Saturn',
    gem1: 'Jupiter',
    gem2: 'Mars',
    gem3: 'Sun',
    can1: 'Venus',
    can2: 'Mercury',
    can3: 'Moon',
    leo1: 'Saturn',
    leo2: 'Jupiter',
    leo3: 'Mars',
    vir1: 'Sun',
    vir2: 'Venus',
    vir3: 'Mercury',
    lib1: 'Saturn',
    lib2: 'Jupiter',
    lib3: 'Mars',
    sco1: 'Sun',
    sco2: 'Venus',
    sco3: 'Mercury',
    sag1: 'Saturn',
    sag2: 'Jupiter',
    sag3: 'Mars',
    cap1: 'Venus',
    cap2: 'Mercury',
    cap3: 'Moon',
    aqu1: 'Saturn',
    aqu2: 'Jupiter',
    aqu3: 'Mars',
    pis1: 'Sun',
    pis2: 'Venus',
    pis3: 'Mercury',
  };
  