const API_BASE = "https://en.wikipedia.org/w/api.php"
const START_CODE = parseInt(0x2F00.toString(16), 16)
const END_CODE = parseInt(0x2FD5.toString(16), 16)
const PROPERTY_MARKER = "|"
const MEANING_PROPERTY = "meaning"
const NEWLINE_MARKER = "\n"
const ROOT = document.getElementById("root")

function querify(baseUrl, query) {
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

function fetchRadical(radicalNumber, radicalCharacter) {
  const title = `Radical_${radicalNumber}`
  const query = {
    action: "query",
    prop: "revisions",
    titles: title,
    rvslots: "*",
    rvprop: "content",
    formatversion: "2",
    format: "json",
    origin: "*"
  }
  return fetch(querify(API_BASE, query))
    .then(res => res.json())
    .then(json => parseRadical(radicalNumber, radicalCharacter, json))
}

function parseRadical(radicalNumber, radicalCharacter, json) {
  const missing = json["query"]?.["pages"]?.[0]?.["missing"] == true
  const content = json["query"]?.["pages"]?.[0]?.["revisions"]?.[0]?.["slots"]?.["main"]?.["content"]

  if (missing || !content) {
    alert("Content was not found")
    return;
  }

  return (textContent => {
    const keyContent = {
      "number": radicalNumber,
      "character": radicalCharacter,
      "meaning": undefined,
    }

    if (textContent.indexOf(MEANING_PROPERTY) > -1) {
      const meaningPropertyMarker = `${PROPERTY_MARKER}${MEANING_PROPERTY}=`
      const meaningIndex = textContent.indexOf(meaningPropertyMarker)
      const meaningEnd = textContent.indexOf(PROPERTY_MARKER, meaningIndex + 1)
      const meaningLine = textContent.substring(meaningIndex, meaningEnd)
      const meaningLineEnd = meaningLine.indexOf(NEWLINE_MARKER)
      const meaning =
        meaningLine
          .replace(meaningPropertyMarker, "")
          .replace(NEWLINE_MARKER, "")
          .substring(0, meaningLineEnd)
          .trim()
      keyContent["meaning"] = meaning
    }
    return keyContent
  })(content)
}

async function fetchRadicals() {
  const radicalPromises = []
  for (let currentCode = START_CODE; currentCode <= END_CODE; currentCode++) {
    const position = currentCode - START_CODE + 1
    const radicalCharacter = String.fromCodePoint(currentCode);
    radicalPromises.push(fetchRadical(position, radicalCharacter))
  }
  return await Promise.all(radicalPromises)
}

function isEmptyOrFalsy(aString) {
  return (!aString || aString.length === 0)
}

function hasSpecialCharacters(aString) {
  return aString.match(/[^A-Za-z0-9,/() ]/)
}

function main() {
  fetchRadicals().then(radicals => {
    const meaninglessRadicals = []
    const radicalsWithSpecialCharacters = []
    radicals.forEach(radical => {
      if (isEmptyOrFalsy(radical.meaning)) {
        meaninglessRadicals.push(radical)
      }

      if (hasSpecialCharacters(radical.meaning)) {
        radicalsWithSpecialCharacters.push(radical)
      }
    })

    console.log(`Found ${meaninglessRadicals.length} radicals without meanings`, meaninglessRadicals)
    console.log(`Found ${radicalsWithSpecialCharacters.length} radicals with special characters`, radicalsWithSpecialCharacters)
  })
}

main()

