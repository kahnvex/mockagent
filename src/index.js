var isArray = require('isarray');
var _superagent, _routes = {};

var _assignRoute = function(status, body, method) {
  return function(route) {
    _routes[route] = {
      status: status,
      body: body
    }

    if (method) {
      _routes[route].method = method;
    }
  };
};

var mockagent = {
  target: function(superagent) {
    _superagent = superagent;
    _superagent.Request.prototype._oldEnd = superagent.Request.prototype.end;

    _superagent.Request.prototype.end = function(fn) {

      var routeObj = _routes[this.url];

      if (! routeObj || (routeObj.method && routeObj.method !== this.method)) {
        return this._oldEnd(fn);
      }

      var body = _routes[this.url].body;

      if (typeof body === 'object') {
        body = JSON.stringify(body);
      }

      var res = {
        status: _routes[this.url].status,
        responseText: body
      };

      setTimeout(function() {
        fn(null, {xhr: res});
      });
    };

  },

  addRoute: function(route, status, body, method) {
    var assignRoute = _assignRoute(status, body, method);

    if (isArray(route)) {
      route.forEach(assignRoute);
    } else {
      assignRoute(route);
    }
  },

  releaseTarget: function() {
    _superagent.Request.prototype.end = _superagent.Request.prototype._oldEnd;
    delete _superagent.Request.prototype._oldEnd;
  }
};

module.exports = mockagent;
