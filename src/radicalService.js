const fs = require("fs")
const querify = require("./querify")

const API_BASE = "https://en.wikipedia.org/w/api.php"
const NEWLINE_MARKER = "\n"
// |meaning=
const MEANING_PROPERTY_MARKER = / *\| *meaning *=/
// [[category_link|text_content]]
// The two last ]] have no escape character because IJ gives a warning.
// I suppose not needed because the open ['s are escaped.
const CATEGORY_LINK_MATCHER = /\[\[(.*)\|(.*)]]/
/**
 * Removes square brackets [] when above fails due to there being no pipe.
 * This happens when the category name is the same as the text.
  */
const EMPTY_LINK_MATCHER = /[\[\]]/g
// |key=
// OR
// }}
const ANY_PROPERTY_OR_END_MARKER = /( *\| *\w+ *=|}})/g
const START_CODE = parseInt(0x2F00.toString(16), 16)
const END_CODE = parseInt(0x2FD5.toString(16), 16)

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
  const missing = json["query"]?.["pages"]?.[0]?.["missing"] === true
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

exports.fetchRadicals = async function() {
  const radicalPromises = []
  for (let currentCode = START_CODE; currentCode <= END_CODE; currentCode++) {
    const position = currentCode - START_CODE + 1
    const radicalCharacter = String.fromCodePoint(currentCode);
    radicalPromises.push(fetchRadical(position, radicalCharacter))
  }
  return await Promise.all(radicalPromises)
}

exports.writeRadicalsToCsv = function(radicals) {
  const writeStream = fs.createWriteStream("./radicals.csv", "utf-8")
  radicals.forEach((radical) => {
    const fields = [radical.character, radical.number, `"${radical.meaning}"`]
    writeStream.write(fields.join(",") + "\n", (error) => {
      if (error) {
        console.error("An error occurred while writing to csv: ", error)
      }
    })
  })
  writeStream.end(() => {
    console.log("CSV created")
  })
}