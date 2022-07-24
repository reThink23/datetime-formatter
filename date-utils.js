const locales = require('./locale/locales')
const constants = require('./constants')

const daysPerMonthInYear = constants.daysPerMonthInYear // {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31}
const daysPerMonthInLeapYear = constants.daysPerMonthInLeapYear // {1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31}

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
	const defaultCfg = constants.defaultCfg
	const cfg = config && config != {} ? Object.assign({}, defaultCfg, config) : defaultCfg
	const optMap = [undefined, 'numeric', '2-digit', 'short', 'long', 'narrow']
	const timeZoneMap = [undefined, 'short', 'shortOffset', 'longOffset', 'long']
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

const dateBetween = (startDate, date, endDate) => {
	return startDate - date <= 0 && endDate - date >= 0  
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
	console.log(new Date());
	if (!date instanceof Date || isNaN(date)) throw new TypeError(`date is not a valid date (Type of date: ${typeof date}; Value of date: ${date})`) // return false

	const relDate = relativeDate || new Date()
	const diff = relDate - date
	const future = diff < 0
	const millisecond = future ? 999 - Math.abs(relDate.getUTCMilliseconds() - date.getUTCMilliseconds()) : Math.abs(relDate.getUTCMilliseconds() - date.getUTCMilliseconds())
	const second = future && millisecond ? Math.abs(relDate.getUTCSeconds() - date.getUTCSeconds()) - 1 : Math.abs(relDate.getUTCSeconds() - date.getUTCSeconds())
	const minute = future && second != 0 ? Math.abs(relDate.getUTCMinutes() - date.getUTCMinutes()) - 1 : Math.abs(relDate.getUTCMinutes() - date.getUTCMinutes())
	const hour = future && minute != 0 ? Math.abs(relDate.getUTCHours() - date.getUTCHours()) - 1 : Math.abs(relDate.getUTCHours() - date.getUTCHours())
	const d = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24)) // Math.abs(relDate.getUTCDate() - date.getUTCDate())
	const week = future ? Math.floor(d / 7) : Math.floor(d / 7)
	const day = future && hour != 0 ? (d - week * 7) - 1 : (d - week * 7)
	const month = Math.abs(relDate.getUTCMonth() - date.getUTCMonth())
	const year = Math.abs(relDate.getUTCFullYear() - date.getUTCFullYear())

	let remainder = Math.abs(diff)
	remainder = (remainder % (1000 * 60 * 60 * 24))
	const resHour = Math.floor(remainder / (1000 * 60 * 60))
	remainder = (remainder % (resHour * 1000 * 60 * 60))
	const resMinute = Math.floor(remainder / (1000 * 60))
	remainder = (remainder % (resMinute * 1000 * 60))
	const resSecond = Math.floor(remainder / (1000))
	remainder = (remainder % (resSecond * 1000))
	const resMillisecond = remainder
	
	const daysPerMonth = date.getUTCFullYear() % 4 == 0 ? daysPerMonthInLeapYear : daysPerMonthInYear
	const relDateMonth = relDate.getUTCMonth(), dateMonth = date.getUTCMonth()
	const startDay = (future ? relDate.getUTCDate() : date.getUTCDate())
	const endDay = (future ? date.getUTCDate() : relDate.getUTCDate())
	const startMonth = (future ? relDateMonth : dateMonth)
	const endMonth = (future ? dateMonth : relDateMonth)
	const startYear = (future ? relDate.getUTCFullYear() : date.getUTCFullYear())
	const endYear = (future ? date.getUTCFullYear() : relDate.getUTCFullYear())
	let days = d, resMonth = 0, resDay = 0, resYear = 0, resWeek = 0

	for (let i = startYear; i < endYear; i++) {
		if (days >= 365) {
			days -= i % 4 == 0 && days >= 366 ? 366 : 365
			resYear += 1
		} else { break }
	}

	if (month == 0) {
		resMonth = 0
		resDay = d
	} else {
		remainingDays = daysPerMonth[startMonth] - startDay
		existingDays = daysPerMonth[endMonth] - endDay
		// resDay = remainingDays + existingDays
		// for (let i = startYear; i < endYear; i++) {
		// 	if (days >= 365) {
		// 		days -= i % 4 == 0 && days >= 366 ? 366 : 365
		// 		resYear += 1	
		// 	} else { break }
		// }
		if (startDay <= endDay) {
			resMonth += 1
			days -= daysPerMonth[startMonth]
		}
		for (let i = startMonth+1; i < endMonth; i++) {
			days -= daysPerMonth[i]
			resMonth += 1	
		}
	}
	while (days >= 7) {
		days -= 7
		resWeek++
	}
	resDay = days
	// resYear = Math.floor(resMonth / 12)
	// resMonth = (resMonth - resYear * 12)
	return {future, inUnits: {year: resYear, month: resMonth, week: resWeek, day: resDay, hour: resHour, minute: resMinute, second: resSecond, millisecond: resSecond}, difference: Math.abs(diff)}
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
		const value = values[idx]
		if (idx > -1) return {unit, value}
	} 
	for (let i = 0; i < values.length; i++) {
		if (values[i] > 0) return lastZero ? {unit: dateTime[i-1], value: values[i-1]} : {unit: dateTime[i], value: values[i]}
	}
	return {value: 0, unit: "millisecond"}
}
/**
 * It takes a unit, value, reference and language code as arguments and returns a string.
 * Format given value with the certain value
 * @param {"year"|"month"|"week"|"day"|"hour"|"minute"|"second"|"millisecond"} unit - the unit to format
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
 * Formats a string of a value and an unit representing the difference between a given date and the relative date
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
	const res = getResult(best.unit, best.value, diff < 0 ? "past" : "future", locale)
	return res
}

/**
 * Formats a string representing the difference between two given dates
 * @param {object} params
 * @param {Date} params.date a Date to get the difference to `relDate`
 * @param {Date|undefined} [params.relDate=undefined] a Date to get the difference from `date`. If undefined defaults to a `new Date()` 
 * @param {"en"|"de"|"es"} [params.langCode=en] a 2-letter Alpha code representing a supported language
 * @param {string} [params.structure="{year}, {month}, {week}, {day}, {hour}, {minute}, {second}"] a string representing the formatting of the output. Available are `{year}`, `{month}`, `{week}`, `{day}`, `{hour}`, `{minute}`, `{second}`
 * @param {boolean} [params.usePrefix=true] if true uses a prefix like `ago` in `2 weeks, 6 days, 5 hours ago` otherwise will be omitted
 * @returns {string} A formatted string with the difference between the two dates.
 */
const formatDifference = ({date, relDate, langCode = "en", structure = "{year}, {month}, {week}, {day}, {hour}, {minute}, {second}", usePrefix=true}={}) => {
	const locale = getDefaultLocale(langCode)
	const lang = locales[locale]
	const dateTime = ["year", "month", "week", "day", "hour", "minute", "second", "millisecond"]
	const diff = getDifference(date, relDate)
	const ref = (diff.future? "future" : "past")
	for (const key in diff.inUnits) {
		const value = diff.inUnits[key];
		const cs = lang[ref].prefix.requiresCase || "nominative"
		const numerus = lang.units[key].case[cs] || lang.units[key].case["nominative"]
		const label = value == 1 ? numerus.singular : numerus.plural
		structure = structure.replace(new RegExp(` {0,1}\\{${key}\\}(,|$)`), value != 0 && label != undefined ? ` ${value} ${label}$1` : '')
	}
	if (usePrefix) {
		const prefixVal = lang[ref].prefix.value
		const str = lang[ref].structure[1].replace("{prefix}", prefixVal)
		structure = str.replace("{value} {unit}", structure)
	}
	return structure.trim()
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

const getNextWeekDay = (date, weekDay) => {
	const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
	const weekDayNo = typeof weekDay === 'number' ? weekDay % 7 : weekDays.indexOf(weekDay)
	if (weekDayNo === -1) return false
	date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	date.setUTCDate(date.getUTCDate() + Math.abs(weekDayNo - (date.getUTCDay() || 7)));
	return date
}

const getLastWeekDay = (date, weekDay) => {
	const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
	const weekDayNo = typeof weekDay === 'number' ? weekDay % 7 : weekDays.indexOf(weekDay)
	if (weekDayNo === -1) return false
	date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	date.setUTCDate(date.getUTCDate() - Math.abs(weekDayNo - (date.getUTCDay() || 7)));
	return date
}

const getWeekDayInMonth = (date, weekDay, position) => {
	const positions = ["first", "second", "third", "last"]
	const pos = typeof position === 'number' ? position % 4 : positions.indexOf(position)
	const daysPerMonth = constants.daysPerMonthInYear[(res.month + 1)]
	if (pos != 3) {
		const weekDayMonthStart = new Date(date.getUTCFullYear(), date.getUTCMonth(), 1).getUTCDay()
		const firstWeekDay = weekDay - weekDayMonthStart
		const first = 1 + (firstWeekDay < 0 ? 7 + firstWeekDay : firstWeekDay)
		for (let i = first, x = 0; i <= daysPerMonth; i += 7) {
			if (pos === x) res.day = i
			x++
		}
	} else {
		const weekDayMonthEnd = new Date(ate.getUTCFullYear(), date.getUTCMonth(), daysPerMonth).getUTCDay()
		const lastWeekDay = weekDay - weekDayMonthEnd
		const last = daysPerMonth + (lastWeekDay > 0 ? 7 - lastWeekDay : lastWeekDay)
		day = last
	}
	date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	date.setUTCDate(day);
	return date
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

const parseDST = (string, year) => {
	const res = {}
	res.year = year ?? new Date().getUTCFullYear()
	const position = ["first", "second", "third", "last"]
	const weekDays = constants.weekDays // ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
	const monthNames = constants.monthNames // ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
	const prefixTime = " at "
	const [date, time] = string.split(prefixTime)
	const dateParts = date.split(' ')
	for (let i = 0; i < dateParts.length; i++) {
		const part = dateParts[i]
		if (position.includes(part.toLowerCase())) res.pos = position.indexOf(part.toLowerCase())
		if (weekDays.includes(part)) res.weekDay = weekDays.indexOf(part)
		if (monthNames.includes(part)) res.month = monthNames.indexOf(part)
		if (part === "before") res.secondWeekDay = weekDays.indexOf(dateParts[i-1])
	}
	const daysPerMonth = constants.daysPerMonthInYear[(res.month + 1)]
	
	if (res.pos != 3) {
		const weekDayMonthStart = new Date(res.year, res.month, 1).getUTCDay()
		const firstWeekDay = res.weekDay - weekDayMonthStart
		const first = 1 + (firstWeekDay < 0 ? 7 + firstWeekDay : firstWeekDay)
		for (let i = first, x=0; i <= daysPerMonth; i+=7) {
			if (res.pos === x) res.day = i
			x++
		}
	} else  {
		const weekDayMonthEnd = new Date(res.year, res.month, daysPerMonth).getUTCDay()
		const lastWeekDay = res.weekDay - weekDayMonthEnd
		const last = daysPerMonth + (lastWeekDay > 0 ? 7 - lastWeekDay : lastWeekDay)
		res.day = last
		// for (let i = last, x=0; i >= 1; i-=7) {
		// 	if (res.pos === x) res.day = i
		// 	x++
		// }
	}
	const t = time.split(' ')
	const [hour, minute] = t[0].split(':')
	const timezoneOffset = t[1] && t[1].includes('UTC') ? t[1].split('UTC')[1] || 0 : 0
	return {year: res.year, month: res.month, day: res.day, hour: parseInt(hour), minute: parseInt(minute)}
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

module.exports = {format, formatRelative, formatDifference, addLeadingZeros, getWeekNumber, objToDate, dateToObj, getDifference, getInUnit, getResult, parseDST}