const API_BASE = "https://en.wikipedia.org/w/api.php"
const START_CODE = parseInt(0x2F00.toString(16), 16)
const END_CODE = parseInt(0x2FD5.toString(16), 16)
const NEWLINE_MARKER = "\n"
// |meaning=
const MEANING_PROPERTY_MARKER = / *\| *meaning *=/
// [[category_link|text_content]]
const CATEGORY_LINK_MATCHER = /\[\[(.*)\|(.*)\]\]/
/**
 * Removes square brackets [] when above fails due to there being no pipe.
 * This happens when the category name is the same as the text.
  */
const EMPTY_LINK_MATCHER = /[\[\]]/g
// |key=
// OR
// }}
const ANY_PROPERTY_OR_END_MARKER = /( *\| *\w+ *=|}})/g

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
    const radicalData = {
      "number": radicalNumber,
      "character": radicalCharacter,
      "meaning": undefined,
    }

    const allPropertiesOrEndMarkers = textContent.match(ANY_PROPERTY_OR_END_MARKER)

    const meaningPropertyIndex = allPropertiesOrEndMarkers.findIndex(prop => prop.includes("meaning"))
    if (meaningPropertyIndex === -1) {
      console.error(`Could not find meaning for radical ${radicalNumber}, property key was missing`)
      return radicalData
    }

    const nextPropertyIndex = meaningPropertyIndex + 1
    if (!allPropertiesOrEndMarkers[nextPropertyIndex]) {
      console.error(`Could not find meaning for radical ${radicalNumber}, properties were not formatted as expected`)
      return radicalData
    }

    const meaningText = textContent.slice(
      textContent.indexOf(allPropertiesOrEndMarkers[meaningPropertyIndex]),
      textContent.indexOf(allPropertiesOrEndMarkers[nextPropertyIndex])
    )


    radicalData["meaning"] =
      meaningText
        .replace(MEANING_PROPERTY_MARKER, "")
        .replace(NEWLINE_MARKER, "")
        // Replace links [[link|text]] with text (second capture)
        .replace(CATEGORY_LINK_MATCHER, "$2")
        .replaceAll(EMPTY_LINK_MATCHER, "")
        .trim()

    return radicalData
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

    console.log(`Found ${radicals.length} radicals`, radicals)
    console.log(`Found ${meaninglessRadicals.length} radicals without meanings`, meaninglessRadicals)
    console.log(`Found ${radicalsWithSpecialCharacters.length} radicals with special characters`, radicalsWithSpecialCharacters)
  })
}

main()

