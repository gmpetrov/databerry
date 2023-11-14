import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import translationAa from './aa/translations.json';
import translationAe from './ae/translations.json';
import translationAf from './af/translations.json';
import translationAk from './ak/translations.json';
import translationAm from './am/translations.json';
import translationAn from './an/translations.json';
import translationAr from './ar/translations.json';
import translationAs from './as/translations.json';
import translationAv from './av/translations.json';
import translationAy from './ay/translations.json';
import translationAz from './az/translations.json';
import translationBa from './ba/translations.json';
import translationBe from './be/translations.json';
import translationBg from './bg/translations.json';
import translationBh from './bh/translations.json';
import translationBi from './bi/translations.json';
import translationBm from './bm/translations.json';
import translationBn from './bn/translations.json';
import translationBo from './bo/translations.json';
import translationBr from './br/translations.json';
import translationBs from './bs/translations.json';
import translationCa from './ca/translations.json';
import translationCh from './ch/translations.json';
import translationCr from './cr/translations.json';
import translationCs from './cs/translations.json';
import translationCv from './cv/translations.json';
import translationCy from './cy/translations.json';
import translationDa from './da/translations.json';
import translationDe from './de/translations.json';
import translationDv from './dv/translations.json';
import translationDz from './dz/translations.json';
import translationEe from './ee/translations.json';
import translationEl from './el/translations.json';
import translationEn from './en/translations.json';
import translationEs from './es/translations.json';
import translationEt from './et/translations.json';
import translationEu from './eu/translations.json';
import translationFa from './fa/translations.json';
import translationFi from './fi/translations.json';
import translationFj from './fj/translations.json';
import translationFr from './fr/translations.json';
import translationFy from './fy/translations.json';
import translationGa from './ga/translations.json';
import translationGd from './gd/translations.json';
import translationGl from './gl/translations.json';
import translationGn from './gn/translations.json';
import translationGu from './gu/translations.json';
import translationGv from './gv/translations.json';
import translationHe from './he/translations.json';
import translationHi from './hi/translations.json';
import translationHr from './hr/translations.json';
import translationHu from './hu/translations.json';
import translationHy from './hy/translations.json';
import translationHz from './hz/translations.json';
import translationIa from './ia/translations.json';
import translationIg from './ig/translations.json';
import translationIi from './ii/translations.json';
import translationIs from './is/translations.json';
import translationIt from './it/translations.json';
import translationJa from './ja/translations.json';
import translationJv from './jv/translations.json';
import translationKa from './ka/translations.json';
import translationKg from './kg/translations.json';
import translationKm from './km/translations.json';
import translationKn from './kn/translations.json';
import translationKo from './ko/translations.json';
import translationKs from './ks/translations.json';
import translationKu from './ku/translations.json';
import translationKw from './kw/translations.json';
import translationKy from './ky/translations.json';
import translationLb from './lb/translations.json';
import translationLg from './lg/translations.json';
import translationLi from './li/translations.json';
import translationLn from './ln/translations.json';
import translationLo from './lo/translations.json';
import translationLt from './lt/translations.json';
import translationLu from './lu/translations.json';
import translationLv from './lv/translations.json';
import translationMh from './mh/translations.json';
import translationMi from './mi/translations.json';
import translationMk from './mk/translations.json';
import translationMl from './ml/translations.json';
import translationMn from './mn/translations.json';
import translationMo from './mo/translations.json';
import translationMr from './mr/translations.json';
import translationMs from './ms/translations.json';
import translationMt from './mt/translations.json';
import translationMy from './my/translations.json';
import translationNa from './na/translations.json';
import translationNb from './nb/translations.json';
import translationNd from './nd/translations.json';
import translationNe from './ne/translations.json';
import translationNl from './nl/translations.json';
import translationNn from './nn/translations.json';
import translationNo from './no/translations.json';
import translationNr from './nr/translations.json';
import translationNv from './nv/translations.json';
import translationNy from './ny/translations.json';
import translationOc from './oc/translations.json';
import translationOj from './oj/translations.json';
import translationOm from './om/translations.json';
import translationOr from './or/translations.json';
import translationOs from './os/translations.json';
import translationPa from './pa/translations.json';
import translationPi from './pi/translations.json';
import translationPl from './pl/translations.json';
import translationPt from './pt/translations.json';
import translationQu from './qu/translations.json';
import translationRm from './rm/translations.json';
import translationRo from './ro/translations.json';
import translationRu from './ru/translations.json';
import translationRw from './rw/translations.json';
import translationSa from './sa/translations.json';
import translationSd from './sd/translations.json';
import translationSe from './se/translations.json';
import translationSg from './sg/translations.json';
import translationSh from './sh/translations.json';
import translationSi from './si/translations.json';
import translationSk from './sk/translations.json';
import translationSl from './sl/translations.json';
import translationSm from './sm/translations.json';
import translationSn from './sn/translations.json';
import translationSo from './so/translations.json';
import translationSq from './sq/translations.json';
import translationSr from './sr/translations.json';
import translationSs from './ss/translations.json';
import translationSt from './st/translations.json';
import translationSu from './su/translations.json';
import translationSv from './sv/translations.json';
import translationSw from './sw/translations.json';
import translationTa from './ta/translations.json';
import translationTe from './te/translations.json';
import translationTg from './tg/translations.json';
import translationTh from './th/translations.json';
import translationTi from './ti/translations.json';
import translationTl from './tl/translations.json';
import translationTn from './tn/translations.json';
import translationTo from './to/translations.json';
import translationTr from './tr/translations.json';
import translationTt from './tt/translations.json';
import translationTw from './tw/translations.json';
import translationUg from './ug/translations.json';
import translationUk from './uk/translations.json';
import translationUr from './ur/translations.json';
import translationVe from './ve/translations.json';
import translationVi from './vi/translations.json';
import translationWa from './wa/translations.json';
import translationXh from './xh/translations.json';
import translationYi from './yi/translations.json';
import translationYo from './yo/translations.json';
import translationZa from './za/translations.json';
import translationZh from './zh/translations.json';
import translationZhHans from './zh-Hans/translations.json';
import translationZhHant from './zh-Hant/translations.json';
import translationZu from './zu/translations.json';

type SupportedLanguages =
  | 'aa'
  | 'ae'
  | 'af'
  | 'ak'
  | 'am'
  | 'an'
  | 'ar'
  | 'as'
  | 'av'
  | 'ay'
  | 'az'
  | 'ba'
  | 'be'
  | 'bg'
  | 'bh'
  | 'bi'
  | 'bm'
  | 'bn'
  | 'bo'
  | 'br'
  | 'bs'
  | 'ca'
  | 'ch'
  | 'cr'
  | 'cs'
  | 'cv'
  | 'cy'
  | 'da'
  | 'de'
  | 'dv'
  | 'dz'
  | 'ee'
  | 'el'
  | 'en'
  | 'es'
  | 'et'
  | 'eu'
  | 'fa'
  | 'fi'
  | 'fj'
  | 'fr'
  | 'fy'
  | 'ga'
  | 'gd'
  | 'gl'
  | 'gn'
  | 'gu'
  | 'gv'
  | 'he'
  | 'hi'
  | 'hr'
  | 'hu'
  | 'hy'
  | 'hz'
  | 'ia'
  | 'ig'
  | 'ii'
  | 'is'
  | 'it'
  | 'ja'
  | 'jv'
  | 'ka'
  | 'kg'
  | 'km'
  | 'kn'
  | 'ko'
  | 'ks'
  | 'ku'
  | 'kw'
  | 'ky'
  | 'lb'
  | 'lg'
  | 'li'
  | 'ln'
  | 'lo'
  | 'lt'
  | 'lu'
  | 'lv'
  | 'mh'
  | 'mi'
  | 'mk'
  | 'ml'
  | 'mn'
  | 'mo'
  | 'mr'
  | 'ms'
  | 'mt'
  | 'my'
  | 'na'
  | 'nb'
  | 'nd'
  | 'ne'
  | 'nl'
  | 'nn'
  | 'no'
  | 'nr'
  | 'nv'
  | 'ny'
  | 'oc'
  | 'oj'
  | 'om'
  | 'or'
  | 'os'
  | 'pa'
  | 'pi'
  | 'pl'
  | 'pt'
  | 'qu'
  | 'rm'
  | 'ro'
  | 'ru'
  | 'rw'
  | 'sa'
  | 'sd'
  | 'se'
  | 'sg'
  | 'sh'
  | 'si'
  | 'sk'
  | 'sl'
  | 'sm'
  | 'sn'
  | 'so'
  | 'sq'
  | 'sr'
  | 'ss'
  | 'st'
  | 'su'
  | 'sv'
  | 'sw'
  | 'ta'
  | 'te'
  | 'tg'
  | 'th'
  | 'ti'
  | 'tl'
  | 'tn'
  | 'to'
  | 'tr'
  | 'tt'
  | 'tw'
  | 'ug'
  | 'uk'
  | 'ur'
  | 've'
  | 'vi'
  | 'wa'
  | 'xh'
  | 'yi'
  | 'yo'
  | 'za'
  | 'zh'
  | 'zhHans'
  | 'zhHant'
  | 'zu';

type Translation = typeof translationEn;

const resources: Record<SupportedLanguages, Translation> = {
  aa: translationAa,
  ae: translationAe,
  af: translationAf,
  ak: translationAk,
  am: translationAm,
  an: translationAn,
  ar: translationAr,
  as: translationAs,
  av: translationAv,
  ay: translationAy,
  az: translationAz,
  ba: translationBa,
  be: translationBe,
  bg: translationBg,
  bh: translationBh,
  bi: translationBi,
  bm: translationBm,
  bn: translationBn,
  bo: translationBo,
  br: translationBr,
  bs: translationBs,
  ca: translationCa,
  ch: translationCh,
  cr: translationCr,
  cs: translationCs,
  cv: translationCv,
  cy: translationCy,
  da: translationDa,
  de: translationDe,
  dv: translationDv,
  dz: translationDz,
  ee: translationEe,
  el: translationEl,
  en: translationEn,
  es: translationEs,
  et: translationEt,
  eu: translationEu,
  fa: translationFa,
  fi: translationFi,
  fj: translationFj,
  fr: translationFr,
  fy: translationFy,
  ga: translationGa,
  gd: translationGd,
  gl: translationGl,
  gn: translationGn,
  gu: translationGu,
  gv: translationGv,
  he: translationHe,
  hi: translationHi,
  hr: translationHr,
  hu: translationHu,
  hy: translationHy,
  hz: translationHz,
  ia: translationIa,
  ig: translationIg,
  ii: translationIi,
  is: translationIs,
  it: translationIt,
  ja: translationJa,
  jv: translationJv,
  ka: translationKa,
  kg: translationKg,
  km: translationKm,
  kn: translationKn,
  ko: translationKo,
  ks: translationKs,
  ku: translationKu,
  kw: translationKw,
  ky: translationKy,
  lb: translationLb,
  lg: translationLg,
  li: translationLi,
  ln: translationLn,
  lo: translationLo,
  lt: translationLt,
  lu: translationLu,
  lv: translationLv,
  mh: translationMh,
  mi: translationMi,
  mk: translationMk,
  ml: translationMl,
  mn: translationMn,
  mo: translationMo,
  mr: translationMr,
  ms: translationMs,
  mt: translationMt,
  my: translationMy,
  na: translationNa,
  nb: translationNb,
  nd: translationNd,
  ne: translationNe,
  nl: translationNl,
  nn: translationNn,
  no: translationNo,
  nr: translationNr,
  nv: translationNv,
  ny: translationNy,
  oc: translationOc,
  oj: translationOj,
  om: translationOm,
  or: translationOr,
  os: translationOs,
  pa: translationPa,
  pi: translationPi,
  pl: translationPl,
  pt: translationPt,
  qu: translationQu,
  rm: translationRm,
  ro: translationRo,
  ru: translationRu,
  rw: translationRw,
  sa: translationSa,
  sd: translationSd,
  se: translationSe,
  sg: translationSg,
  sh: translationSh,
  si: translationSi,
  sk: translationSk,
  sl: translationSl,
  sm: translationSm,
  sn: translationSn,
  so: translationSo,
  sq: translationSq,
  sr: translationSr,
  ss: translationSs,
  st: translationSt,
  su: translationSu,
  sv: translationSv,
  sw: translationSw,
  ta: translationTa,
  te: translationTe,
  tg: translationTg,
  th: translationTh,
  ti: translationTi,
  tl: translationTl,
  tn: translationTn,
  to: translationTo,
  tr: translationTr,
  tt: translationTt,
  tw: translationTw,
  ug: translationUg,
  uk: translationUk,
  ur: translationUr,
  ve: translationVe,
  vi: translationVi,
  wa: translationWa,
  xh: translationXh,
  yi: translationYi,
  yo: translationYo,
  za: translationZa,
  zh: translationZh,
  zhHans: translationZhHans,
  zhHant: translationZhHant,
  zu: translationZu,
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: [
      'aa',
      'ae',
      'af',
      'ak',
      'am',
      'an',
      'ar',
      'as',
      'av',
      'ay',
      'az',
      'ba',
      'be',
      'bg',
      'bh',
      'bi',
      'bm',
      'bn',
      'bo',
      'br',
      'bs',
      'ca',
      'ch',
      'cr',
      'cs',
      'cv',
      'cy',
      'da',
      'de',
      'dv',
      'dz',
      'ee',
      'el',
      'en',
      'es',
      'et',
      'eu',
      'fa',
      'fi',
      'fj',
      'fr',
      'fy',
      'ga',
      'gd',
      'gl',
      'gn',
      'gu',
      'gv',
      'he',
      'hi',
      'hr',
      'hu',
      'hy',
      'hz',
      'ia',
      'in',
      'ig',
      'ii',
      'is',
      'it',
      'ja',
      'jv',
      'ka',
      'kg',
      'km',
      'kn',
      'ko',
      'ks',
      'ku',
      'kw',
      'ky',
      'lb',
      'lg',
      'li',
      'ln',
      'lo',
      'lt',
      'lu',
      'lv',
      'mh',
      'mi',
      'mk',
      'ml',
      'mn',
      'mo',
      'mr',
      'ms',
      'mt',
      'my',
      'na',
      'nb',
      'nd',
      'ne',
      'nl',
      'nn',
      'no',
      'nr',
      'nv',
      'ny',
      'oc',
      'oj',
      'om',
      'or',
      'os',
      'pa',
      'pi',
      'pl',
      'pt',
      'qu',
      'rm',
      'ro',
      'ru',
      'rw',
      'sa',
      'sd',
      'se',
      'sg',
      'sh',
      'si',
      'sk',
      'sl',
      'sm',
      'sn',
      'so',
      'sq',
      'sr',
      'ss',
      'st',
      'su',
      'sv',
      'sw',
      'ta',
      'te',
      'tg',
      'th',
      'ti',
      'tl',
      'tn',
      'to',
      'tr',
      'tt',
      'tw',
      'ug',
      'uk',
      'ur',
      've',
      'vi',
      'wa',
      'xh',
      'yi',
      'yo',
      'za',
      'zh',
      'zhHans',
      'zhHant',
      'zu',
    ],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      caches: [],
    },
  });

export default i18n;
