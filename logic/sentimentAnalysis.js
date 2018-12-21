// Náthia Marrafon

var sentiment = require('sentiment');
var trainedData = require('./training.js');
var naiveBayes = require('./naive_bayes.js');
module.exports = function(text) {
  return sentiment(text, trainedData);
}