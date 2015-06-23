var isArray = require('isarray');
var _superagent, _urls = {};
var url = require('url');

var _assignurl = function(status, body, method) {
  return function(url) {
    _urls[url] = {
      status: status,
      body: body
    }

    if (method) {
      _urls[url].method = method;
    }
  };
};

var mockagent = {
  target: function(superagent) {
    _superagent = superagent;
    _superagent.Request.prototype._oldEnd = superagent.Request.prototype.end;

    _superagent.Request.prototype.end = function(fn) {

      var parsedUrl = url.parse(this.url);
      delete parsedUrl.search;
      delete parsedUrl.hash;

      var urlObj = _urls[parsedUrl.format()];

      if (! urlObj || (urlObj.method && urlObj.method !== this.method)) {
        return this._oldEnd(fn);
      }

      var body = urlObj.body;
      var res = { method: urlObj.method };

      if (typeof body === 'object') {
        body = JSON.stringify(body);
      }

      if (typeof urlObj.status === 'function') {
        res = urlObj.status.bind(this)(res);
      } else {
        res.xhr = {
          status: urlObj.status,
          responseText: body
        };
      }

      setTimeout(function() {
        if (res && res.xhr && res.xhr.status > 299) {
          // Status code is in the 200 range, return response successfully
          var err = new Error(res.statusText || 'Unsuccessful HTTP response');
          err.status = res.xhr.status;
          err.response = res;
          err.original = null;

          return fn(err, null);
        }

        fn(null, res);
      });
    };

  },

  url: function(url, status, body, method) {
    var assignurl = _assignurl(status, body, method);

    if (isArray(url)) {
      url.forEach(assignurl);
    } else {
      assignurl(url);
    }
  },

  get: function(url, status, body) {
    this.url(url, status, body, 'GET');
  },

  put: function(url, status, body) {
    this.url(url, status, body, 'PUT');
  },

  post: function(url, status, body) {
    this.url(url, status, body, 'POST');
  },

  del: function(url, status, body) {
    this.url(url, status, body, 'DELETE');
  },

  patch: function(url, status, body) {
    this.url(url, status, body, 'PATCH');
  },

  head: function(url, status, body) {
    this.url(url, status, body, 'HEAD');
  },

  options: function(url, status, body) {
    this.url(url, status, body, 'OPTIONS');
  },

  releaseTarget: function() {
    _superagent.Request.prototype.end = _superagent.Request.prototype._oldEnd;
    delete _superagent.Request.prototype._oldEnd;
    _urls = {};
  }
};

module.exports = mockagent;
