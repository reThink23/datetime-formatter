const locales = require('./locale/locales')

const daysPerMonthInYear = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31}
const daysPerMonthInLeapYear = {1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31}
const timeEarthRotation = {hour: 23, minute: 56, second: 4, millisecond: 90, microsecond: 530}
const timeEarthRevolution = {day: 365, hour: 6, minute: 9}

/**
 * @description formats a given date Object with the given format
 * @param {{year: number, month: number, day?: number, hour?: number, minute?: number, second?: number, millisecond?: number} | Date} dateObj Date or object with year, month, day, hour, minute, second, millisecond 
 * @param {string} formatTemplate a string containing the formatting like `dddd, DD.MM.YYYY @ HH:mm:ss.SSS A` where `Y` = year, `M` = month, `D` = day, `d` = week day, `h` = hour (24), `H` = hour (12), `m` = minute, `s` = second, `S` = millisecond, `A` = am/pm, `[text]` = text which should not be parsed. Any character can be changed by using the config parameter
 * @param {string | string[] | undefined} [locale='en-GB'] one or more locale language two letter codes like `en` or two letter code with additional country code `en-GB`
 * @param {{year?: string, month?: string, day?: string, hour?: string, minute?: string, second?: string, millisecond?: string, weekDay?: string, weekOfYear?: string, hour12?: string, dayPeriod?: string, textStart?: string, textEnd?: string}} [config=undefined] a single char indicating which date part should be where. (`textStart` and `textEnd` define characters where the text between them should be preserved)
 * @return {string | false} formatted dateTime as string or `false` if `dateObj` is neither a valid `date` nor `dateObj` (at least containing properties `year` and `month`)
 */
const format = (dateObj, formatTemplate, locale="en-GB", config=undefined) => {
	if (!((dateObj instanceof Date && !isNaN(dateObj)) || (typeof dateObj === Object && dateObj.year !== undefined & dateObj.month !== undefined))) throw new TypeError(`dateObj is not a valid date or not an object containing at least the properties month and year (Type of dateObj: ${typeof dateObj}; Value of dateObj: ${dateObj})`) // return false
	const defaultCfg = { 
		year: 'Y', month: 'M', day: 'D', hour: 'h', minute: 'm', second: 's', millisecond: 'S', 
		weekDay: 'd', weekOfYear: 'w', hour12: 'H', dayPeriod: 'A', era: 'E', timeZone: 'Z',
		textStart: '[', textEnd: ']',
	}
	const cfg = config ? Object.assign({}, defaultCfg, config) : defaultCfg
	optMap = [undefined, 'numeric', '2-digit', 'short', 'long', 'narrow']
	timeZoneMap = [undefined, 'short', 'shortOffset', 'longOffset', 'long']
	const date = objToDate(dateObj) || dateObj
	const dateAsObj = dateToObj(dateObj) || dateObj
	const locales = locale
	const templateArr = formatTemplate.match(new RegExp(`(?:\\${cfg.textStart}[\\w ]+\\${cfg.textEnd}|(.)\\1*)`, 'g'))
	// const locales = [...locale].split(/(, |,)/g)


	// iterate over template, check for a match with config, and replace it in the right format 
	for (let i = 0; i < templateArr.length; i++) {
		const tmpl = templateArr[i];
		for (const key in cfg) {
			const fmt = cfg[key];
			if (tmpl[0] === fmt) {
				if (['day', 'hour', 'minute', 'second'].includes(key)) {
					templateArr[i] = tmpl.length >= 2 ? addLeadingZeros(dateAsObj[key], 2) : dateAsObj[key].toString()
				} else if (key == 'month') {
					templateArr[i] = new Intl.DateTimeFormat(locales, {month: tmpl.length <= 4 ? optMap[tmpl.length] || 'numeric' : 'long'}).format(date)
				} else if (key == 'year') {
					templateArr[i] = tmpl.length > 2 ? dateAsObj[key].toString() : dateAsObj[key].toString().slice(2,4)
				} else if (key == 'dayPeriod') {
					templateArr[i] = tmpl.length >= 3 ? new Intl.DateTimeFormat(locales, {day: '2-digit', dayPeriod: 'long'}).formatToParts(date)[2].value : (dateAsObj['hour'] > 12? 'pm': 'am')
				} else if (key == 'hour12') {
					templateArr[i] = dateAsObj['hour'] > 12 ? (dateAsObj['hour'] - 12).toString(): dateAsObj['hour'].toString()
				} else if (key == 'millisecond') {
					templateArr[i] = new Intl.DateTimeFormat(locales, {fractionalSecondDigits: tmpl.length <= 3 ? tmpl.length : 3}).format(date)
				} else if (key == 'weekDay') {
					templateArr[i] = new Intl.DateTimeFormat(locales, {weekday: tmpl.length <= 3 ? 'short' : 'long'}).format(date)
				} else if (key == 'weekOfYear') {
					templateArr[i] = tmpl.length >= 2 ? addLeadingZeros(getWeekNumber(date)) : getWeekNumber(date)
				} else if (key == 'era') {
					templateArr[i] = new Intl.DateTimeFormat(locales, {year: 'numeric', era: tmpl.length > 2 ? 'long' : 'short'}).formatToParts(date)[2].value
				} else if (key == 'timeZone') {
					if (date.getTimezoneOffset) {
						templateArr[i] =  new Intl.DateTimeFormat(locales, {year: 'numeric', timeZoneName: tmpl.length <= 4 ? timeZoneMap[tmpl.length] || '' : 'long'}).formatToParts(date)[2].value
					}
				} else if (key == 'textStart') {
					templateArr[i] = tmpl.substring(1, tmpl.length-1)
				}
			}
		}
	}
	return templateArr.join('')
}

/**
 * @description add leading zeros to given number
 * @param {number | string} num number to add leading zeros to
 * @param {number} length how many characters long should the resulting string be?
 * @return {string | false} the resulting string with added zeros if necessary, if `num.toString().length > length` return num as string
 */
const addLeadingZeros = (num, length=2) => {
	const numStr = num.toString()
	if (numStr.length > length) return ''
	return (numStr.length < length ? '0'.repeat(length - numStr.length) + numStr : numStr)
}

/**
 * Check if number is within a range.
 * @param {number} min - The minimum value of the range
 * @param {number} x - number to check
 * @param {number} max - the maximum value of the range
 * @param {boolean} [includeMin=true] - if true `min` is inclusive
 * @param {boolean} [includeMax=false] - if true `max` is inclusive
 * @returns {boolean} if number is in range or not.
 */
const between = (min, x, max, includeMin = true, includeMax = false) => {
	const start = includeMin? min-1 : min
	const end = includeMax? max + 1 : max 
	return start < x < end
}

/**
 * @description converts a date to an Object containing `year`, `month`, `day`, `hour`, `minute`, `second` and `millisecond`
 * @param {Date} date an instance of date
 * @return {{year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number} | false} return an `Object` containing `year`, `month`, `day`, `hour`, `minute`, `second` and `millisecond` or `false` if given date is not a date or is not a valid date
 */
const dateToObj = (date) => {
	if (!date instanceof Date || isNaN(date)) throw new TypeError(`date is not a valid date (Type of date: ${typeof date}; Value of date: ${date})`) // return false
	return date instanceof Date ? {
		year: date.getFullYear(),
		month: date.getMonth(),
		day: date.getDate(),
		hour: date.getHours(),
		minute: date.getMinutes(),
		second: date.getSeconds(),
		millisecond: date.getMilliseconds()
	}: date
}

/**
 * @description converts a Object containing properties `year`, `month`, `day`, `hour`, `minute`, `second`, `millisecond` to a `date`
 * @param {{year: number, month: number, day?: number, hour?: number, minute?: number, second?: number, millisecond?: number}} dateObj Object containing properties `year`, `month`, `day`, `hour`, `minute`, `second`, `millisecond`
 * @return {date | false} instance of date or false if param `dateObj` doesn't contain at least a `year` and a `month` property
 */
const objToDate = (dateObj) => {
	if (typeof dateObj === Object && dateObj.year !== undefined & dateObj.month !== undefined) throw new TypeError(`dateObj is not a valid Object containing the properties year and month (type of dateObj: ${typeof dateObj}; value of dateObj: ${dateObj})`) // return false
	return dateObj instanceof Date ? dateObj : new Date(dateObj.year, dateObj.month - 1, dateObj.day || 0, dateObj.hour || 0, dateObj.minute || 0, dateObj.second || 0, dateObj.millisecond || 0)
}

/**
 * It returns an object with the difference between two dates in years, months, weeks, days, hours,
 * minutes, seconds, and milliseconds
 * @param {Date} date - The date to compare to.
 * @param {Date} [relativeDate=undefined] - The date to compare to. If not provided, the current date is used.
 * @returns {{future: boolean, inUnits: {year: number, month: number, week: number, day: number, hour: number, minute: number, second: number, millisecond: number}, difference: number}} An object with the following properties:
 * - future: A boolean indicating whether the date is in the future or not.
 * - inUnits: An object with the following properties:
 *   - year: The number of years between the two dates.
 *   - month: The number of months between the two dates.
 *   - week: The number of weeks between the two dates.
 *   - day: The number of days between the two dates.
 *   - hour: The number of hours between the two dates.
 *   - minute: The number of minutes between the two dates.
 *   - second: The number of seconds between the two dates.
 *   - millisecond: The number of milliseconds between the two dates.
 * - difference: the difference in milliseconds
 */
const getDifference = (date, relativeDate=undefined) => {
	if (!date instanceof Date || isNaN(date)) throw new TypeError(`date is not a valid date (Type of date: ${typeof date}; Value of date: ${date})`) // return false
	
	const relDate = relativeDate || new Date()
	const diff = relDate - date
	const future = diff < 0
	const year = Math.abs(relDate.getUTCFullYear() - date.getUTCFullYear())
	const month = future && year != 0 ? 12 - Math.abs(relDate.getUTCMonth() - date.getUTCMonth()) : Math.abs(relDate.getUTCMonth() - date.getUTCMonth())
	const d = Math.abs(relDate.getUTCDate() - date.getUTCDate())
	const week = future && month != 0 ? 6 - Math.floor(d / 7) : Math.floor(d / 7)
	const day = future && week != 0 ? 6 - (d - week * 7) : (d - week * 7)
	const hour = future && day != 0 ? 23 - Math.abs(relDate.getUTCHours() - date.getUTCHours()) : Math.abs(relDate.getUTCHours() - date.getUTCHours())
	const minute = future && hour != 0 ? 59 - Math.abs(relDate.getUTCMinutes() - date.getUTCMinutes()) : Math.abs(relDate.getUTCMinutes() - date.getUTCMinutes())
	const second = future && minute != 0 ? 59 - Math.abs(relDate.getUTCSeconds() - date.getUTCSeconds()) : Math.abs(relDate.getUTCSeconds() - date.getUTCSeconds())
	const millisecond = future && second != 0 ? 999 - Math.abs(relDate.getUTCMilliseconds() - date.getUTCMilliseconds()) : Math.abs(relDate.getUTCMilliseconds() - date.getUTCMilliseconds())

	return {future, inUnits: {year, month, week, day, hour, minute, second, millisecond}, difference: Math.abs(diff)}
}

/**
 * It takes a number of milliseconds and returns the largest unit that is not zero
 * @param {number} milliseconds - The amount of milliseconds to convert.
 * @param {"year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond"|undefined} [unit=undefined] - unit to convert the `value` to, defaults to `undefined`. If `undefined` returns the largest unit which is not zero.
 * @param {boolean} [lastZero=false] - If true, it will return the last unit that is zero. Useful if you only want a rough time span rather than specific values
 * @returns {["year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond", number]} An array with two values. The first value is the unit of time, and the second value is the
 * amount of time.
 */
const getInUnit = (milliseconds, unit=undefined, lastZero=false) => {
	const millisecond = milliseconds
	const second = Math.floor(millisecond / 1000)
	const minute = Math.floor(second / 60)
	const hour = Math.floor(minute / 60)
	const day = Math.floor(hour / 24)
	const week = Math.floor(day / 7)
	const month = Math.floor(day / 30.46875)
	const year = Math.floor(month / 12)
	// const decade = Math.floor(year / 10)
	// const century = Math.floor(year / 100)
	const dateTime = ["year", "month", "week", "day", "hour", "minute", "second", "millisecond"]
	const values = [year, month, week, day, hour, minute, second, millisecond]
	if (unit !== undefined) {
		const idx = dateTime.indexOf(unit)
		if (idx > -1) return [unit, values[idx]]
	} 
	for (let i = 0; i < values.length; i++) {
		if (values[i] > 0) return lastZero ? [dateTime[i-1], values[i-1]] : [dateTime[i], values[i]]
	}
	return [0, "millisecond"]
}
/**
 * It takes a `unit`, value, reference and language code as arguments and returns a string.
 * @param {"year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond"} unit - the `unit` to format
 * @param {number} value - value of a `unit` if 0 `ref` defaults to `present`, if 1 instead of the value a keyword will be used in the formatting string, otherwise display value as digit.
 * @param {"past"|"present"|"future"} [ref=future] - a reference if the value is in the `future` or in the `past`. If `value` is 0, this defaults to `present` 
 * @param {"en"|"de"|"es"} [langCode=en] - The language code to display the result in.
 * @returns {string} formatted string
 */
const getResult = (unit, value, ref="future", langCode="en") => {
	const lang = locales[langCode]
	var st = ""
	var prefix = lang[ref].prefix.value
	const gender = lang.units[unit].gender
	const cs = lang[ref].prefix.requiresCase || "nominative"
	if (value == 1) {
		value = lang[ref].single[gender]
		label = lang.units[unit].case[cs].singular
		if (unit == "day") { return lang[ref].daySpecific } else { st = lang[ref].structure[0] }
	} else if (value == 0) {
		prefix = lang.present.prefix.value
		value = lang.present.single[gender]
		label = lang.units[unit].case[cs].singular
		if (unit == "day") { return lang.present.daySpecific } else { st = lang.present.structure[0] }
	} else {
		label = lang.units[unit].case[cs].plural
		if (value == 2 && unit == "day" && lang[ref].daySpecific2) { return lang[ref].daySpecific2 } else { st = lang[ref].structure[1] }
	}
	st = st.replace("{prefix}", prefix)
	st = st.replace("{unit}", label)
	st = st.replace("{value}", value)
	return st
}

/**
 * takes a date, a relative date, a unit, and a language code, and returns a
 * string representing the difference between the the date and the relative date
 * @param {Date} date - The date to format.
 * @param {undefined|Date} [relDate=undefined] - The date to compare to. If not provided, the current date is used.
 * @param {undefined|"year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond"} [unit=undefined] - unit to represent, defaults to `undefined`. If `undefined` returns the largest unit which is not zero.
 * @param {"en"|"de"|"es"} [langCode=en] - The language code for the language, which should the date represented in
 * @returns {string} formatted string
 */
const formatRelative = (date, relDate=undefined, unit=undefined, langCode=undefined) => {
	const locale = getDefaultLocale(langCode) 
	const rel = relDate || new Date()
	const diff = date - rel
	const best = getInUnit(Math.abs(diff), unit ? unit : undefined)
	const res = getResult(best[0], best[1], diff < 0 ? "past" : "future", locale)
	return res
}

const formatDifference = (date, relDate, langCode="en") => {
	const locale = getDefaultLocale(langCode)
	const lang = locales[locale]
	let structure = "{prefix} {year}, {month}, {week}, {day}, {hour}, {minute}, {second}"
	const diff = getDifference(date, relDate)
	const prefix = diff.future ? lang.future.prefix.value : lang.past.prefix.value
	for (const key in diff.inUnits) {
		const value = diff.inUnits[key];
		const cs = lang[(diff.future? "future" : "past")].prefix.requiresCase || "nominative"
		const numerus = lang.units[key].case[cs]
		const label = value == 1 ? numerus.singular : numerus.plural
		structure = structure.replace(new RegExp(` \\{${key}\\}(,|$)`), value != 0 && label != undefined ? ` ${value} ${label}$1` : '')
	}
	structure = structure.replace("{prefix}", prefix)
	return structure
}

/**
 * get week of year by date
 * @param {Date} date - The date you want to get the week number for.
 * @returns {number} The week number of the year.
 */
const getWeekNumber = (date) => {
	date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	// Set to nearest Thursday: current date + 4 - current day number
	// Make Sunday's day number 7
	date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
	var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	var weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
	return weekNo;
}

/**
 * If the locale code is not defined, get the default locale code from the browser/system. If the locale code
 * is defined, use it. If the locale code is not defined and the browser locale code is not supported,
 * use English
 * @param {string} [localeCode] - The locale code to use. If not provided, the default locale will be used.
 * @returns {string} The locale code
 */
const getDefaultLocale = (localeCode=undefined) => {
	const langCode = (localeCode || Intl.DateTimeFormat().resolvedOptions().locale).split("-")[0]
	return Object.keys(locales).includes(langCode) ? langCode : "en"
}

// function validateStructure(obj, required={}, hasOnlyRequired=false, onlyOwnProperties=true, validateTypes=false) {
// 	if(!onlyOwnProperties && obj.length !== required.length) return false
// 	for (const key in required) {
// 		if (onlyOwnProperties) {
// 			if (Object.hasOwnProperty.call(obj, key)) {
// 				if (!obj.has(key)) return false
// 				if(hasOnlyRequired && !required.has(key)) return false	
// 				if (validateTypes && typeof obj[key] !== required[key]) return false
// 			}
// 		} else {
// 			if (key != el) return false
// 			if(hasOnlyRequired && !required.includes(key)) return false
// 		}
// 	}
// 	return true
// }

module.exports = {format, formatRelative, formatDifference, addLeadingZeros, getWeekNumber, objToDate, dateToObj, getDifference, getInUnit, getResult}