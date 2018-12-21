// Daniel Izario

var util = require('util'),
  twitter = require('twitter'),
  sentimentAnalysis = require('./sentimentAnalysis'),
  db = require('diskdb');

db = db.connect('db', ['sentiments']);

var config = {
  consumer_key: 'aJPBh565wDOo43pM4W3f5Q0QV',
  consumer_secret: 'kemb6pReF1phoTk2Vi7tVmMenKP2i4gNGaNmUG0dJi91iz7gvP',
  access_token_key: '109918896-63tEJKf0H5cr0uSDmAYsIX3HslVxhSLXQjKF7G8p',
  access_token_secret: 'q9W73V5uMHxDr6lfHjXHw06MTSIrBqOfW5meHnTHQDqOp'
}

module.exports = function(text, callback) {
  var twitterClient = new twitter(config);
  var response = [], dbData = [];
  twitterClient.search(text, function(data) {
    for (var i = 0; i < data.statuses.length; i++) {
      var resp = {};
      resp.tweet = data.statuses[i];
      resp.sentiment = sentimentAnalysis(data.statuses[i].text);
      dbData.push({
        "tweet" : resp.tweet.text,
        "score" : resp.sentiment.score
      });
      response.push(resp);
    };
    db.sentiments.save(dbData);
    callback(response);
  });
}
