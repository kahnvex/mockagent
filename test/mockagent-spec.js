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
    mockagent.get('/hello', 200, 'response');

    superagent.get('/hello').end(function(err, res) {
      expect(res).to.deep.equal({
        xhr: {
          responseText: 'response',
          status: 200
        }
      });

      expect(err).to.equal(null);

      done();
    });
  });

  it('fails a request', function(done) {
    mockagent.get('/hello', 400, 'response');

    superagent.get('/hello').end(function(err, res) {
      expect(err).to.deep.equal({
        xhr: {
          responseText: 'response',
          status: 400
        }
      });
      done();
    });
  });

  describe('multiple urls', function(done) {
    var expected = {
      xhr: {
        responseText: {hi: 'back'},
        status: 200
      }
    };

    beforeEach(function() {
      var urls = ['/route-one', '/route-two'];
      mockagent.url(urls, 200, {
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

  describe('response functions', function() {

    it('returns a response from a function', function(done) {
      mockagent.get('/fake-url', function(res) {
        res.xhr = {
          responseText: 'fake response',
          status: 201
        };

        return res;
      });

      superagent.get('/fake-url').end(function(err, res) {
        expect(res.xhr.responseText).to.equal('fake response');
        done();
      });
    });
  });
});
