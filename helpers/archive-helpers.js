var fs = require('fs');
var path = require('path');
var _ = require('underscore');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

var urlPath = exports.paths.list;

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  fs.readFile(urlPath, 'utf8', function(err, data) {
    list = data.substring(0, data.length - 1).split('~').map(function(urlTup) {
      return JSON.parse(urlTup);
    });
    if (callback) {
      callback(list);
    }
  });
};

exports.isUrlInList = function(url, callback) {
  var checkUrl = function(urlList) {
    var bool = _.some(urlList, function(item) {
      console.log('list url = ', item[0], 'passed in url = ', url);
      return item[0] === url;
    });
    if (callback) {
      callback(bool);
    }
  };
  exports.readListOfUrls(checkUrl);
};

exports.addUrlToList = function(url, callback) {
  var writeUrl = function(isUrl) {
    if (!isUrl) {
      var urlTup = [url, false];
      fs.appendFile(urlPath, JSON.stringify(urlTup) + '~');
      console.log('Added URL to list');
    } else {
      console.log('URL already in list.');
    }
  };
  exports.isUrlInList(url, writeUrl);
};

exports.isUrlArchived = function(url, callback) {
  var urlList = exports.readListOfUrls();
  urlList.forEach(function(urlTup) {
    if (urlTup[0] === url) {
      return urlTup[1];
    }
  });
};

exports.downloadUrls = function(urls) {
};
