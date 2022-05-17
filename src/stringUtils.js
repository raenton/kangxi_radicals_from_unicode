exports.hasSpecialCharacters = function (aString) {
  return aString.match(/[^A-Za-z0-9,/() ]/)
}

exports.isEmptyOrFalsy = function (aString) {
  return (!aString || aString.length === 0)
}