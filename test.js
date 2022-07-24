const {getInUnit, getResult, formatRelative, formatDifference, getDifference, format, parseDST} = require('./date-utils')
// const d = new Date()
// const today = new Date(d.getFullYear(), d.getMonth(), d.getDate())
// const dif = new Date(2022, 6, 13) - today
// const best = getInUnit(Math.abs(dif))
// const res = getResult(best[0], best[1], dif < 0 ? "past" : "future", "de")
// console.log(res)
// console.log(best);
// console.log(formatRelative(new Date(2022, 6, 16, 20, 0), new Date(2022, 6, 11, 20, 0), "day"));
// console.log(formatDifference({date: new Date(2022, 6, 17, 12, 30), langCode: "en"}));
// const d = new Date()
// console.log(d.getMinutes(), d.getSeconds(), d.getMilliseconds());
// console.log(format(d, "hh:mm:ss.SSS"));
// const diff = getDifference(new Date(2022, 7, 30, 14, 30, 26))
// console.log(diff);
// console.log(diff.inUnits.year, diff.inUnits.month, diff.inUnits.week, diff.inUnits.day, diff.inUnits.hour, diff.inUnits.minute, diff.inUnits.second, diff.inUnits.millisecond);
// console.log(format(new Date(2022, 4, 23, 8, 30, 45, 876), "dddd in ww, D. MMMM YY (E), HH:mm:ss.SSS AAAA Z", "de"))
console.log(parseDST("Last Sunday in February at 1:00 UTC"));