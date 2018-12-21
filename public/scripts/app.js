// Náthia Marrafon

$(document).ready(function() {
  $("#searchText").on('keypress', function(e) {
    if (e.which == 13 || e.keyCode == 13) {
      if ($(this).val().trim().length > 0) {
        fireAJAX($(this).val().trim());
      }
    }
  });

  function fireAJAX(text) {
    $.ajax({
      type: "POST",
      url: "/search",
      data: {
        "search": text
      },
      beforeSend: function(xhr) {
        $('.tweet-results').html('');
        $('.results').show();
        enableState();
      },
      success: parseData,
      error: oops
    });
  }

  function parseData(data) {
    disableState();
    var html = '';
    for (var i = 0; i < data.length; i++) {

      var s = data[i].sentiment,
        t = data[i].tweet;

      var _o = {
        imgSrc: t.user.profile_image_url,
        tweetLink: 'http://twitter.com/' + t.user.screen_name + '/status/' + t.id_str,
        tweet: t.text.substring(0, 140),
        score: s.score,
        retweet: t.retweet_count ? t.retweet_count : 0,
		classificacao: s.score == 0 ? 'Neutro' : s.score > 0 ? 'Positivo' : 'Negativo',
		wordsMatched: s.words && s.words.length ? s.words : '--',
        positiveWords: s.positive && s.positive.length ? s.positive : '--',
        negativeWords: s.negative && s.negative.length ? s.negative : '--'
      };

      html += tmpl('tweet_tmpl', _o);
    };
    $('.tweet-results').html(html);
  }

  function oops(data) {
    $('.error').show();
    disableState();
  }

  function disableState() {
	$('.loading').hide();
	$('#searchText').prop('disabled', false);
  }

  function enableState() {
    $('.loading').show();
    $('#searchText').prop('disabled', true);
  }

});

(function() {
  var cache = {};

  this.tmpl = function tmpl(str, data) {
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
      tmpl(document.getElementById(str).innerHTML) :

    new Function("obj",
      "var p=[],print=function(){p.push.apply(p,arguments);};" +

      "with(obj){p.push('" +

      str
      .replace(/[\r\t\n]/g, " ")
      .split("{{").join("\t")
      .replace(/((^|\}\})[^\t]*)'/g, "$1\r")
      .replace(/\t=(.*?)}}/g, "',$1,'")
      .split("\t").join("');") 
      .split("}}").join("p.push('")
      .split("\r").join("\\'") + "');}return p.join('');");

    return data ? fn(data) : fn;
  };
})();