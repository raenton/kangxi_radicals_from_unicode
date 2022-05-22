module.exports = function(baseUrl = "", query = {}) {
  const keys = Object.keys(query)
  const keyCount = keys.length

  if (!baseUrl) {
    return ""
  }

  if (keyCount === 0) {
    return baseUrl
  }

  return keys.reduce((acc, key, index) => {
    return acc + (`${key}=${query[key]}${index + 1 === keyCount ? "" : "&"}`)
  }, baseUrl + "?")
}