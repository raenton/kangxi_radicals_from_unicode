const { hasSpecialCharacters, isEmptyOrFalsy } = require("./stringUtils")
const { fetchRadicals, writeRadicalsToCsv } = require("./radicalService")

async function main() {
  const radicals = await fetchRadicals()
  const meaninglessRadicals = radicals.filter(radical => isEmptyOrFalsy(radical.meaning))
  const radicalsWithSpecialCharacters = radicals.filter(radical => hasSpecialCharacters(radical.meaning))

  console.log(`Found ${radicals.length} radicals`, radicals)
  console.log(`Found ${meaninglessRadicals.length} radicals without meanings`, meaninglessRadicals)
  console.log(`Found ${radicalsWithSpecialCharacters.length} radicals with special characters`, radicalsWithSpecialCharacters)

  if (radicals.length === 214
  && meaninglessRadicals.length === 0 &&
  radicalsWithSpecialCharacters.length === 0) {
    writeRadicalsToCsv(radicals)
  } else {
    console.log("Failed to create CSV, one or more issues with radicals were found")
  }
}

main().then(() => console.log("Done!"))