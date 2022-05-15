const OPEN_CONTENT_WINDOW = true
const QUERY_FORMAT = "json"
const START_CODE = parseInt(0x2F00.toString(16), 16)
const END_CODE = parseInt(0x2FD5.toString(16), 16)

const rootElement = document.getElementById("root")

for (let currentCode = START_CODE; currentCode <= END_CODE; currentCode++) {
  const position = currentCode - START_CODE + 1
  const node = document.createElement("p")
  node.innerText = position + " " + String.fromCodePoint(currentCode)
  rootElement.appendChild(node)
}

const API_BASE = "https://en.wikipedia.org/w/api.php"
const query = {
  action: "query",
  prop: "revisions",
  titles: "Radical_1",
  rvslots: "*",
  rvprop: "content",
  formatversion: "2",
  format: QUERY_FORMAT,
  origin: "*"
}

function querify(query) {
  const keys = Object.keys(query)
  const keyCount = keys.length
  let result = "?"
  for (let keyIndex = 0; keyIndex + 1 <= keyCount; keyIndex++) {
    const isLastKey = keyIndex + 1 === keyCount
    const keyName = keys[keyIndex]
    const keyValue = query[keyName]
    result += (`${keyName}=${keyValue}${isLastKey ? "" : "&"}`)
  }
  return result
}

const queryUrl = API_BASE + querify(query)

const wikiPromise = fetch(queryUrl)

if (OPEN_CONTENT_WINDOW) {
  switch (query["format"]) {
    case "html":
      wikiPromise.then(res => res.text())
        .then(html => {
          const win = window.open("", "Wiki content", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=200,top=" + (screen.height - 400) + ",left=" + (screen.width - 840))
          win.document.body.innerHTML = html
        })
      break;
    case "json":
      wikiPromise.then(res => res.json())
        .then(json => {
          const content = json.query?.pages[0]?.revisions[0]?.slots?.main?.content

          if (content) {
            const win = window.open("", "Wiki content", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=800,top=" + (screen.height - 400) + ",left=" + (screen.width - 840))

            const modifiedContent = content.replaceAll("\n", "<br />", )

            win.document.body.innerHTML = JSON.stringify(modifiedContent, undefined, 2)
          } else {
            console.error("Content was not found")
          }
        })
      break;
    default:
      console.error("Format is not supported")
  }
} else {
  switch (query["format"]) {
    case "json":
      wikiPromise.then(res => res.json())
        .then(console.log)
      break;
    default:
      console.error("Format is not supported")
  }
}
