var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var fetcher = require('../workers/htmlFetcher');
var CronJob = require('cron').CronJob;


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
var archivePath = exports.paths.archivedSites;
var loadingPath = exports.paths.siteAssets + '/loading.html';

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  fs.readFile(urlPath, 'utf8', function(err, data) {
    if (err) {
      console.log(err, ' = Readfile error');
    }
    if (data) {
      list = data.substring(0, data.length - 1).split('~').map(function(url) {
        return JSON.parse(url);
      });
    } else {
      list = [];
    }
    if (callback) {
      callback(list);
    }
  });
};

exports.isUrlInList = function(url, callback) {
  var checkUrl = function(urlList) {
    var bool = _.some(urlList, function(item) {
      console.log('list url = ', item, 'passed in url = ', url);
      return item === url;
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
      fs.appendFile(urlPath, JSON.stringify(url) + '~');
      console.log('Added URL to list');
    } else {
      console.log('URL already in list.');
    }
  };
  exports.isUrlInList(url, writeUrl);
};

exports.isUrlArchived = function(url, callback) {
  var shortUrl = url;
  if (url.substring(0, 7) === 'http://') {
    shortUrl = url.substring(7);
  }
  fs.lstat(archivePath + '/' + shortUrl, function(err, stats) {
    if (err) {
      console.log('Error reading archived page: ', err);
      if (callback) {
        callback(url, false);
      }
    } else {
      callback(url, true);
    }
  });
};

exports.writePage = function(website, url) {
  if (url.substring(0, 7) === 'http://') {
    url = url.substring(7);
  }
  fs.writeFile(archivePath + '/' + url, website, function(err) {
    if (err) {
      console.log('Error: ', err);
    }
    console.log('Site archived!');
  });
};

exports.downloadUrls = function(urls) {
  var download = function(url, isArchived) {
    if (!isArchived) {
      fetcher.fetchPage(url, (website) => {
        exports.writePage(website, url);
      });
    } 
  };
  
  urls.forEach(function(url) {
    exports.isUrlArchived(url, download);
  });
};


exports.renderPage = function(res, url, isArchived) {
  var shortUrl = url;
  if (url.substring(0, 7) === 'http://') {
    shortUrl = url.substring(7);
  }
  if (isArchived) {
    fs.readFile(archivePath + '/' + shortUrl, function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  } else {
    exports.addUrlToList(url);
    fs.readFile(loadingPath, function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  }
};

exports.requestPage = function(url, res) {
  exports.isUrlArchived(url, exports.renderPage.bind(this, res));
};

new CronJob('* * * * * 1', function() {
  console.log('Job every minute');
  var unarchived = [];
  var getPages = function(list) {
    exports.downloadUrls(list);
  };
  exports.readListOfUrls(getPages);
}, null, true, 'America/Los_Angeles');
