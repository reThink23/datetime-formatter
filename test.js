const { dateBetween } = require('./date-utils');
const {getInUnit, getResult, formatRelative, formatDifference, getDifference, format, parseDST} = require('./date-utils')

console.log(parseDST("Friday before last Sunday in February at 1:00 UTC-0230"));
console.log(dateBetween(new Date(2022, 3, 23), new Date(2022, 3, 23), new Date(2022, 3, 23)));

const start = 1