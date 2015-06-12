var isArray = require('isarray');
var _superagent, _urls = {};

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

      var urlObj = _urls[this.url];

      if (! urlObj || (urlObj.method && urlObj.method !== this.method)) {
        return this._oldEnd(fn);
      }

      var body = urlObj.body;

      if (typeof body === 'object') {
        body = JSON.stringify(body);
      }

      var res = {
        status: urlObj.status,
        responseText: body
      };

      setTimeout(function() {
        if (urlObj.status > 299) {
          return fn({xhr: res}, null);
        }

        fn(null, {xhr: res});
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
  }
};

module.exports = mockagent;
