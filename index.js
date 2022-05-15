const rootElement = document.getElementById("root")
const START_CODE = parseInt(0x2F00.toString(16), 16)
const END_CODE = parseInt(0x2FD5.toString(16), 16)

for (let currentCode = START_CODE; currentCode <= END_CODE; currentCode++) {
  const position = currentCode - START_CODE + 1
  const node = document.createElement("p")
  node.innerText = position + " " + String.fromCodePoint(currentCode)
  rootElement.appendChild(node)
}