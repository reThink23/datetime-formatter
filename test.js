const {getInUnit, getResult, formatRelative, formatDifference} = require('./date-utils')

// const d = new Date()
// const today = new Date(d.getFullYear(), d.getMonth(), d.getDate())
// const dif = new Date(2022, 6, 13) - today
// const best = getInUnit(Math.abs(dif))
// const res = getResult(best[0], best[1], dif < 0 ? "past" : "future", "de")
// console.log(res)
// console.log(best);
// console.log(formatRelative(new Date(2022, 6, 16, 20, 0), new Date(2022, 6, 11, 20, 0), "day"));
console.log(formatDifference(new Date(2022, 6, 30, 12), undefined, "en"));

// const diff = getDifference(new Date(2022, 6, 30, 14, 30, 26))
// console.log(format(new Date(2022, 4, 23, 8, 30, 45, 876), "dddd in ww, D. MMMM YY (E), HH:mm:ss.SSS AAAA Z", "de"))
