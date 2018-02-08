const request = require('request');



var fetchPage = function(url, callback) {
  if (url.substring(0, 7) !== 'http://') {
    url = 'http://' + url;
  }
  request(url, (err, res, body) => {
    err ? console.log(err) : callback(body);
  });
};

exports.fetchPage = fetchPage;