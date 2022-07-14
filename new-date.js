/**
 * @description formats a given date Object
 * @param {{year: number, month: number, day?: number, hour?: number, minute?: number, second?: number, millisecond?: number} | Date} dateObj Date or object with year, month, day, hour, minute, second, millisecond 
 * @param {String} formatTemplate a string containing the formatting like `dddd, DD.MM.YYYY @ HH:mm:ss.SSS A` where `Y` = year, `M` = month, `D` = day, `d` = week day, `h` = hour (24), `H` = hour (12), `m` = minute, `s` = second, `S` = millisecond, `A` = am/pm, `[text]` = text which should not be parsed
 * @param {string | string[] | undefined} locale a locale language two letter code `en` or two letter code with additional country code `en-GB`
 * @return {string} formatted datetime as string
 */
function format(dateObj, formatTemplate, locale="en-GB", config=undefined) {
	const cfg = config || { 
		year: 'Y', month: 'M', day: 'D', hour: 'h', minute: 'm', second: 's', millisecond: 'S', 
		// monthName: 'MMMM', monthNameShort: 'MMM', weekOfYear: 'w', 
		weekDay: 'd', hour12: 'H', dayPeriod: 'A', timeZone: 'Z', textStart: '[', textEnd: ']'
	}
	optMap = [undefined, 'numeric', 'two-digit', 'short', 'long', 'narrow']
	timeZoneMap = [undefined, 'short', 'shortOffset', 'longOffset', 'long']
	const date = dateObj instanceof Date ? dateObj : new Date(dateObj.year, dateObj.month, dateObj.day, dateObj.hour, dateObj.minute, dateObj.second, dateObj.millisecond)
	const dateAsObj = dateObj instanceof Date ? {
		year: date.getFullYear(),
		month: date.getMonth(),
		day: date.getDate(),
		hour: date.getHours(),
		minute: date.getMinutes(),
		second: date.getSeconds(),
		millisecond: date.getMilliseconds()
	} : dateObj
	const templateArr = formatTemplate.match(new RegExp(`(?:\\${cfg.textStart}[\\w ]+\\${cfg.textEnd}|(.)\\1*)`, 'g'))
	const locales = locale.split(/(, |,)/g)


	// iterate over template, check for a match with formatting, and replace it in the right format 
	for (let i = 0; i < templateArr.length; i++) {
		const tmpl = templateArr[i];
		for (const key in cfg) {
			const fmt = cfg[key];
			if (tmpl[0] === fmt) {
				if (['day', 'hour', 'minute', 'second'].includes(key)) {
					templateArr[i] = tmpl.length >= 2 ? addLeadingZeros(dateAsObj[key], 2) : dateAsObj[key].toString()
				} else if (key == 'month') {
					templateArr[i] = Intl.DateTimeFormat(locales, {month: tmpl.length <= 4 ? optMap[tmpl.length] || '' : 'long'}).format(date)
				} else if (key == 'year') {
					templateArr[i] = tmpl.length > 2 ? dateAsObj[key].toString() : dateAsObj[key].toString().slice(2,4)
				} else if (key == 'dayPeriod') {
					templateArr[i] = dateAsObj['hour'] > 12? 'pm': 'am'
				} else if (key == 'hour12') {
					templateArr[i] = dateAsObj['hour'] > 12 ? (dateAsObj['hour'] - 12).toString(): dateAsObj['hour'].toString()
				} else if (key == 'millisecond') {
					templateArr[i] = Intl.DateTimeFormat(locales, {fractionalSecondDigits: tmpl.length <= 3 ? tmpl.length : 3}).format(date)
				} else if (key == 'weekDay') {
					templateArr[i] = Intl.DateTimeFormat(locales, {weekday: tmpl.length <= 3 ? 'short' : 'long'}).format(date)
				} else if (key == 'timeZone') {
					if (date.getTimezoneOffset) {
						templateArr[i] = Intl.DateTimeFormat(locales, {timeZoneName: tmpl.length <= 4 ? timeZoneMap[tmpl.length] || '' : 'long'}).format(date)
					}
				} else if (key == 'textStart') {
					templateArr[i] = tmpl.substring(1, tmpl.length-1)
				}
			}
		}
	}
	return templateArr.join('')
}

function addLeadingZeros(num, length = 2) {
	const numStr = num.toString()
	if (numStr.length > length) return numStr
	return (numStr.length < length ? '0'.repeat(length - numStr.length) + numStr : numStr)
}

console.log(format(new Date(), "dddd, D. MMM YY, [some txt] HH:mm:ss.SSS", "de"))