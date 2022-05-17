const ANKI_URL = "http://127.0.0.1:8765"

function invoke(action, params = {}, version = 6) {
  return fetch(ANKI_URL, {
    method: "POST",
    body: JSON.stringify({ action, params, version })
  }).then(res => res.json())
}

exports.createDeck = async (deckName) => await invoke("createDeck", {deck: deckName})

exports.deleteDecks = async (deckNames) => await invoke("deleteDecks", {
  decks: deckNames,
  cardsToo: true
})