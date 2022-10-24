const fairRandom = (start=0, end) => {
	const r = Math.random()
	const diff = Math.abs(end - start)
	for (let i = 0; i <= diff+1; i++) {
		if (r <= i/diff) return start + i
	}
}
console.log(fairRandom(1,2))

const splitAt = (string, index) => [string.slice(0, index), string.slice(index)]

const splitEvery = (string, every) => {
	var v = 0
	const res = []
	var i = 0
	while (i < string.length) {
		i += every
		if (i >= string.length) i = string.length
		res.push(string.slice(v, i))
		v += every
	}
	return res
}

console.log(splitEvery(['s','o','m','e','t','h','i','n','g'], 4))
const d = 0