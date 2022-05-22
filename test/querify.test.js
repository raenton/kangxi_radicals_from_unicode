const expect = require("chai").expect
const querify = require("../src/querify")

describe("querify", function() {
  const dummyUrl = "https://website.co.uk"

  it("forms a query string with one parameter", function() {
    expect(querify(dummyUrl, {
      firstParameter: "1"
    })).to.equal(`${dummyUrl}?firstParameter=1`)
  })

  it("forms a query string with multiple parameters", function() {
    expect(querify(dummyUrl, {
      firstParameter: "1",
      secondParameter: "2",
      thirdParameter: "3"
    })).to.equal(`${dummyUrl}?firstParameter=1&secondParameter=2&thirdParameter=3`)
  })

  it("returns the url when there are no parameters", function() {
    expect(querify(dummyUrl, {})).to.equal(dummyUrl)
  })

  it("returns an empty string when url is not provided", function() {
    expect(querify()).to.equal("")
  })

  it("returns an empty string when url is undefined", function() {
    expect(querify(null, {
      firstParameter: "1"
    })).to.equal("")
  })
})