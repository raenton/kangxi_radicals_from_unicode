const ANKI_URL = "http://127.0.0.1:8765"

function invoke(action, params = {}, version = 6) {
  return fetch(ANKI_URL, {
    method: "POST",
    body: JSON.stringify({ action, params, version })
  })
}

exports.createDeck = async function (deckName) {
  const response = await invoke("createDeck", { deck: deckName })
  console.log(await response.json())
}

exports.deleteDecks = async function(deckNames) {
  const response = await invoke("deleteDecks", {
    decks: deckNames,
    cardsToo: true
  })
  console.log(await response.json())
}