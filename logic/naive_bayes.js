// Náthia Marrafon

module.exports = function (options) {
  return new Naivebayes(options)
}

var STATE_KEYS = module.exports.STATE_KEYS = [
  'categories', 'docCount', 'totalDocuments', 'vocabulary', 'vocabularySize',
  'wordCount', 'wordFrequencyCount', 'options'
];

module.exports.fromJson = function (jsonStr) {
  var parsed;
  try {
    parsed = JSON.parse(jsonStr)
  } catch (e) {
    throw new Error('Naivebayes.fromJson expects a valid JSON string.')
  }
  var classifier = new Naivebayes(parsed.options)
  STATE_KEYS.forEach(function (k) {
    if (typeof parsed[k] === 'undefined' || parsed[k] === null) {
      throw new Error('Naivebayes.fromJson: JSON string is missing an expected property: `'+k+'`.')
    }
    classifier[k] = parsed[k]
  })
  return classifier
}

var defaultTokenizer = function (text) {
  var rgxPunctuation = /[^(a-zA-ZA-Яa-я0-9_)+\s]/g
  var sanitized = text.replace(rgxPunctuation, ' ')
  return sanitized.split(/\s+/)
}

function Naivebayes (options) {
  this.options = {}
  if (typeof options !== 'undefined') {
    if (!options || typeof options !== 'object' || Array.isArray(options)) {
      throw TypeError('NaiveBayes got invalid `options`: `' + options + '`. Pass in an object.')
    }
    this.options = options
  }
  this.tokenizer = this.options.tokenizer || defaultTokenizer
  this.vocabulary = {}
  this.vocabularySize = 0
  this.totalDocuments = 0
  this.docCount = {}
  this.wordCount = {}
  this.wordFrequencyCount = {}
  this.categories = {}
}

Naivebayes.prototype.initializeCategory = function (categoryName) {
  if (!this.categories[categoryName]) {
    this.docCount[categoryName] = 0
    this.wordCount[categoryName] = 0
    this.wordFrequencyCount[categoryName] = {}
    this.categories[categoryName] = true
  }
  return this
}

Naivebayes.prototype.learn = function (text, category) {
  var self = this
  self.initializeCategory(category)
  self.docCount[category]++
  self.totalDocuments++
  var tokens = self.tokenizer(text)
  var frequencyTable = self.frequencyTable(tokens)
  Object
  .keys(frequencyTable)
  .forEach(function (token) {
    if (!self.vocabulary[token]) {
      self.vocabulary[token] = true
      self.vocabularySize++
    }
    var frequencyInText = frequencyTable[token]
    if (!self.wordFrequencyCount[category][token])
      self.wordFrequencyCount[category][token] = frequencyInText
    else
      self.wordFrequencyCount[category][token] += frequencyInText
    self.wordCount[category] += frequencyInText
  })
  return self
}

Naivebayes.prototype.categorize = function (text) {
  var self = this
    , maxProbability = -Infinity
    , chosenCategory = null
  var tokens = self.tokenizer(text)
  var frequencyTable = self.frequencyTable(tokens)
  Object
  .keys(self.categories)
  .forEach(function (category) {
    var categoryProbability = self.docCount[category] / self.totalDocuments
    var logProbability = Math.log(categoryProbability)
	Object
    .keys(frequencyTable)
    .forEach(function (token) {
      var frequencyInText = frequencyTable[token]
      var tokenProbability = self.tokenProbability(token, category)
      logProbability += frequencyInText * Math.log(tokenProbability)
    })
    if (logProbability > maxProbability) {
      maxProbability = logProbability
      chosenCategory = category
    }
  })
  return chosenCategory
}

Naivebayes.prototype.tokenProbability = function (token, category) {
  var wordFrequencyCount = this.wordFrequencyCount[category][token] || 0
  var wordCount = this.wordCount[category]
  return ( wordFrequencyCount + 1 ) / ( wordCount + this.vocabularySize )
}

Naivebayes.prototype.frequencyTable = function (tokens) {
  var frequencyTable = Object.create(null)
  tokens.forEach(function (token) {
    if (!frequencyTable[token])
      frequencyTable[token] = 1
    else
      frequencyTable[token]++
  })
  return frequencyTable
}

Naivebayes.prototype.toJson = function () {
  var state = {}
  var self = this
  STATE_KEYS.forEach(function (k) {
    state[k] = self[k]
  })
  var jsonStr = JSON.stringify(state)
  return jsonStr
}