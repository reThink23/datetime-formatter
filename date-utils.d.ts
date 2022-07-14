type numberString = `${number}`
type hour = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24
type dateObjOpt = {year: number, month: number, day?: number, hour?: number, minute?: number, second?: number, millisecond?: number}
type dateObj = {year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number}
type config = {year?: string, month?: string, day?: string, hour?: string, minute?: string, second?: string, millisecond?: string, weekDay?: string, weekOfYear?: string, hour12?: string, dayPeriod?: string, textStart?: string, textEnd?: string}

export function format(dateObj: dateObjOpt | Date, formatTemplate: string, locale: string | string[] | undefined = "en-GB", config: config): string | false
export function addLeadingZeros(num: number | numberString, length: number = 2): string | false
export function dateToObj(date: Date): dateObj | false
export function objToDate(dateObj: dateObjOpt): Date | false

export function getDifference(date: Date, refDate: Date | undefined): {future: boolean, inUnits: {year: number, month: number, week: number, day: number, hour: number, minute: number, second: number, millisecond: number}, difference: number}
/**
 * It takes a number of milliseconds and returns the largest unit that is not zero
 * @param {number} milliseconds - The amount of milliseconds to convert.
 * @param {"year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond"|undefined} [unit=undefined] - unit to convert the value to, defaults to `undefined`. If `undefined` returns the largest unit which is not zero.
 * @param {boolean} [lastZero=false] - If true, it will return the last unit that is zero. Useful if you only want a rough time span rather than specific values
 * @returns {["year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond", number]} An array with two values. The first value is the unit of time, and the second value is the
 * amount of time.
 */
export function getInUnit(milliseconds: number, unit: "year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond"|undefined = undefined, lastZero: boolean = false): ["year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond", number]
/**
 * It takes a dateTime, value, reference and language code as arguments and returns a string.
 * @param {"year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond"} unit - the dateTime to format
 * @param {number} value - value of a dateTime if 0 `ref` defaults to `present`, if 1 instead of the value a keyword will be used in the formatting string, otherwise display value as digit.
 * @param {"past"|"present"|"future"} [ref=future] - a reference if the value is in the `future` or in the `past` if `value` is 0, this defaults to `present` 
 * @param {"en"|"de"|"es"} [langCode=en] - The language code to display the result in.
 * @returns {string} formatted string
 */
export function getResult(unit: "year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond", value: number, ref: "past"|"present"|"future", langCode="en"|"de"|"es"): ["year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond", number]
/**
 * takes a date, a relative date, a unit, and a language code, and returns a
 * string representing the difference between the the date and the relative date
 * @param {Date} date - The date to format.
 * @param {undefined|Date} [relDate=undefined] - The date to compare to. If not provided, the current date is used.
 * @param {undefined|"year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond"} [unit=undefined] - unit to represent, defaults to `undefined`. If `undefined` returns the largest unit which is not zero.
 * @param {"en"|"de"|"es"} [langCode=en] - The language code for the language, which should the date represented in
 * @returns {string} formatted string
 */
export function formatRelative(date : Date, relDate : Date | undefined = undefined, unit : "year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond" | undefined = undefined, langCode : "en"|"de"|"es" = "en") : string
// export function between(min: number, x: number, max: number, includeMin: boolean = true, includeMax: boolean = false): boolean
// export function getWeekNumber(date: Date): number
