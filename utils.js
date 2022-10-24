/**
 * @description add leading zeros to given number
 * @param {number | string} num number to add leading zeros to
 * @param {number} length how many characters long should the resulting string be?
 * @return {string | false} the resulting string with added zeros if necessary, if `num.toString().length > length` return num as string
 */
const addLeadingZeros = (num, length = 2) => {
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
	const start = includeMin ? min - 1 : min
	const end = includeMax ? max + 1 : max
	return start < x < end
}

/**
 * If the locale code is not defined, get the default locale code from the browser/system. If the locale code
 * is defined, use it. If the locale code is not defined and the browser locale code is not supported,
 * use English
 * @param {string} [localeCode] - The locale code to use. If not provided, the default locale will be used.
 * @returns {string} The locale code
 */
const getDefaultLocale = (localeCode = undefined) => {
	const langCode = (localeCode || Intl.DateTimeFormat().resolvedOptions().locale).split("-")[0]
	return Object.keys(locales).includes(langCode) ? langCode : "en"
}

const splitAt = (string, index) => [string.slice(0, index), string.slice(index)]

// const toTitleCase = (string) => {
// 	return (typeof string == "string" ? string.split(" "): string).map((val) => {const str = val.toString(); return str[0].toUpperCase() + str.slice(1).toLowerCase()}).join(" ")
// 	const arr = string.split(" ")
// 	for (let i = 0; i < arr.length; i++) {
// 		arr[i] = arr[i][0] + arr[i].slice(1).toLowerCase();
// 	}
// 	return arr.join(" ")
// }

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
module.exports = {addLeadingZeros, between, splitAt, getDefaultLocale}