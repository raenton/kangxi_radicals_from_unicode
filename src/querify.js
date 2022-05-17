module.exports = function(baseUrl, query) {
  const keys = Object.keys(query)
  const keyCount = keys.length
  let result = `${baseUrl}?`
  for (let keyIndex = 0; keyIndex + 1 <= keyCount; keyIndex++) {
    const isLastKey = keyIndex + 1 === keyCount
    const keyName = keys[keyIndex]
    const keyValue = query[keyName]
    result += (`${keyName}=${keyValue}${isLastKey ? "" : "&"}`)
  }
  return result
}