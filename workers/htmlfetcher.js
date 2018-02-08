const request = require('request');



var fetchPage = function(url, callback) {
  request(url, (err, res, body) => {
    err ? reject(err) : callback(body);
  });
};

exports.fetchPage = fetchPage;