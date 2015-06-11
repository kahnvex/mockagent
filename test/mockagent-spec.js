var expect = require('chai').expect;
var mockagent = require('../src/index');
var superagent = require('superagent');


describe('mockagent', function() {
  var addRoute;

  before(function() {
    mockagent.target(superagent);
  });

  after(function() {
    mockagent.releaseTarget();
  });

  it('mocks a requests', function(done) {
    mockagent.addRoute('/hello', 200, 'response', 'GET');

    superagent.get('/hello').end(function(err, res) {
      expect(res).to.deep.equal({
        xhr: {
          responseText: 'response',
          status: 200
        }
      });
      done();
    });
  });

  it('fails a request', function(done) {
    mockagent.addRoute('/hello', 400, 'response', 'GET');

    superagent.get('/hello').end(function(err, res) {
      expect(err).to.deep.equal({
        xhr: {
          responseText: 'response',
          status: 400
        }
      });
      done();
    });
  })

  describe('multiple routes', function(done) {
    var expected = {
      xhr: {
        responseText: {hi: 'back'},
        status: 200
      }
    };

    beforeEach(function() {
      var routes = ['/route-one', '/route-two'];
      mockagent.addRoute(routes, 200, {
        hi: 'back'
      }, 'PUT');
    });

    it('mocks the first route', function(done) {
      superagent.put('/route-one').end(function(err, res) {
        res.xhr.responseText = JSON.parse(res.xhr.responseText);
        expect(res).to.deep.equal(expected);
        done();
      });
    });

    it('mocks the second route', function(done) {
      superagent.put('/route-two').end(function(err, res) {
        res.xhr.responseText = JSON.parse(res.xhr.responseText);
        expect(res).to.deep.equal(expected);
        done();
      });
    });
  });
});
