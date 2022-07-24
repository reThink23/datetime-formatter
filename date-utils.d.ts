type NumberString = `${number}`
type Hour = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24
type SupportedLanguageCodes = "en"|"de"|"es"
type SupportedUnits = "year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond"
type DateObjOptionals = {year: number, month: number, day?: number, hour?: number, minute?: number, second?: number, millisecond?: number}
type DateObj = {year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number}
type FormatOptions = {year?: string, month?: string, day?: string, hour?: string, minute?: string, second?: string, millisecond?: string, weekDay?: string, weekOfYear?: string, hour12?: string, dayPeriod?: string, textStart?: string, textEnd?: string}
type FormatDifferenceParams = {date : Date, relDate? : Date, langCode? : SupportedLanguageCodes = "en", structure? : string = "{year}, {month}, {week}, {day}, {hour}, {minute}, {second}", usePrefix? : boolean = true}

export function format(dateObj: DateObjOptionals | Date, formatTemplate: string, locale: string | string[] | undefined, config: FormatOptions): string | false
export function addLeadingZeros(num: number | NumberString, length: number): string | false
export function dateToObj(date: Date): DateObj | false
export function objToDate(dateObj: DateObjOptionals): Date | false

export function getDifference(date: Date, refDate: Date | undefined): {future: boolean, inUnits: {year: number, month: number, week: number, day: number, hour: number, minute: number, second: number, millisecond: number}, difference: number}
/**
 * It takes a number of milliseconds and returns the largest unit that is not zero
 * @param {number} milliseconds - The amount of milliseconds to convert.
 * @param {"year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond"|undefined} [unit=undefined] - unit to convert the value to, defaults to `undefined`. If `undefined` returns the largest unit which is not zero.
 * @param {boolean} [lastZero=false] - If true, it will return the last unit that is zero. Useful if you only want a rough time span rather than specific values
 * @returns {{unit: "year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond",value: number}} An Object with unit and value. 
 * unit is a string representation of unit of time, and value is the amount of time.
 */
export function getInUnit(milliseconds: number, unit: SupportedUnits|undefined, lastZero: boolean): {unit: SupportedUnits, value: number}
/**
 * It takes a unit, value, reference and language code as arguments and returns a string.
 * @param {"year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond"} unit - the unit to format the {@link value} to
 * @param {number} value - value of a dateTime. If 0, {@link ref} defaults to `"present"`, if this is 1 a keyword instead of the value will be used in the formatting string, otherwise represent value as digit.
 * @param {"past"|"present"|"future"} [ref=future] - a reference if the value is in the `future` or in the `past` if `value` is 0, this defaults to `present` 
 * @param {"en"|"de"|"es"} [langCode=en] - The supported language code to display the result in.
 * @returns {string} formatted string
 */
export function getResult(unit: SupportedUnits, value: number, ref: "past"|"present"|"future", langCode: SupportedUnits): string
/**
 * takes a date, a relative date, a unit, and a language code, and returns a
 * string representing the difference between the the date and the relative date
 * @param {Date} date - The date to format.
 * @param {undefined|Date} [relDate=undefined] - The date to compare to. If not provided, the current date is used.
 * @param {undefined|"year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond"} [unit=undefined] - unit to represent, defaults to `undefined`. If `undefined` returns the largest unit which is not zero.
 * @param {"en"|"de"|"es"} [langCode=en] - The language code for the language, which should the date represented in
 * @returns {string} formatted string
 */
export function formatRelative(date : Date, relDate : Date | undefined, unit : SupportedUnits | undefined, langCode : SupportedLanguageCodes) : string
//  * @param {{date : Date, relDate? : Date, langCode? : "en"|"de"|"es", structure? : string, usePrefix? : boolean}} params Object for possible parameters. Only {@link date} is required
/**
 * Formats a string representing the difference between two given dates
 * @param {date} date a Date to get the difference to {@link relDate}
 * @param {date|undefined} [relDate=undefined] a Date to get the difference from {@link date}. If not provided defaults to current date. 
 * @param {"en"|"de"|"es"} [langCode=en] a 2-letter Alpha code representing a supported language. If not provided defaults to a `"en"`
 * @param {string} [structure="{year}, {month}, {week}, {day}, {hour}, {minute}, {second}"] a string representing the formatting of the output.
 * Available are `{year}`, `{month}`, `{week}`, `{day}`, `{hour}`, `{minute}`, `{second}`, `{millisecond}`. 
 * If undefined defaults to a `"{year}, {month}, {week}, {day}, {hour}, {minute}, {second}"`
 * @param {boolean} [usePrefix=true] if true uses a prefix like `ago` in `2 weeks, 6 days, 5 hours ago`. Otherwise will be omitted
 * @returns {string} A formatted string with the difference between the two dates.
 */
export function formatDifference({date, relDate, langCode = "en", structure = "{year}, {month}, {week}, {day}, {hour}, {minute}, {second}", usePrefix = true}: FormatDifferenceParams = {}) : string
 // export function between(min: number, x: number, max: number, includeMin: boolean = true, includeMax: boolean = false): boolean
 // export function getWeekNumber(date: Date): number