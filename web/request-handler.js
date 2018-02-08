var path = require('path');
var archive = require('../helpers/archive-helpers');
var httpHelper = require('./http-helpers.js');
const querystring = require('querystring');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
  if (req.method === 'GET') {
    if (req.url === '/') {
      httpHelper.serveAssets(res, 'index');
    } else if (req.url === '/styles.css') {
      httpHelper.serveAssets(res, 'css');
    } else {
      //res.end(archive.paths.list);
    }
  } else if (req.method === 'POST') {
    var body = '';
    req.on('data', (chunk) => {
      body += chunk;
    }).on('end', () => {
      body = querystring.parse(body);
      console.log('Body: ', body);
      res.writeHead(201, httpHelper.headers);
      archive.requestPage(body.url, res);
      //res.end();
    });
  }
};
