const { hasSpecialCharacters, isEmptyOrFalsy } = require("./stringUtils")
const { fetchRadicals } = require("./radicalService")

async function main() {
  const radicals = await fetchRadicals()
  const meaninglessRadicals = radicals.filter(radical => isEmptyOrFalsy(radical.meaning))
  const radicalsWithSpecialCharacters = radicals.filter(radical => hasSpecialCharacters(radical.meaning))

  console.log(`Found ${radicals.length} radicals`, radicals)
  console.log(`Found ${meaninglessRadicals.length} radicals without meanings`, meaninglessRadicals)
  console.log(`Found ${radicalsWithSpecialCharacters.length} radicals with special characters`, radicalsWithSpecialCharacters)
}

main().then(() => console.log("Done!"))