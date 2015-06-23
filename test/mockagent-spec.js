var expect = require('chai').expect;
var mockagent = require('../src/index');
var superagent = require('superagent');


describe('mockagent', function() {
  var addRoute;

  beforeEach(function() {
    mockagent.target(superagent);
  });

  afterEach(function() {
    mockagent.releaseTarget();
  });

  it('returns a mock body', function(done) {
    mockagent.get('/hello', 200, 'response');

    superagent.get('/hello').end(function(err, res) {
      expect(res.xhr.responseText).to.equal('response');
      expect(err).to.equal(null);
      done();
    });
  });

  it('excludes querystrings in matching', function(done) {
    mockagent.get('/querystring', 200, 'querystrings are neat');

    superagent.get('/querystring?foo=bar').end(function(err, res) {
      expect(res.xhr.responseText).to.equal('querystrings are neat');
      expect(err).to.equal(null);
      done();
    });
  });

  it('fails a request', function(done) {
    mockagent.get('/hello', 400, 'response');

    superagent.get('/hello').end(function(err, res) {
      expect(err.response.xhr.status).to.deep.equal(400);
      done();
    });
  });

  it('sends GET requests', function(done) {
    mockagent.get('/', 200, 'response');

    superagent.get('/').end(function(err, res) {
      expect(res.method).to.equal('GET');
      done();
    });
  });

  it('sends PUT requests', function(done) {
    mockagent.put('/', 200, 'response');

    superagent.put('/').end(function(err, res) {
      expect(res.method).to.equal('PUT');
      done();
    });
  });

  it('sends PATCH requests', function(done) {
    mockagent.patch('/', 200, 'response');

    superagent.patch('/').end(function(err, res) {
      expect(res.method).to.equal('PATCH');
      done();
    });
  });

  it('sends POST requests', function(done) {
    mockagent.post('/', 200, 'response');

    superagent.post('/').end(function(err, res) {
      expect(res.method).to.equal('POST');
      done();
    });
  });

  it('sends DELETE requests', function(done) {
    mockagent.del('/', 200, 'response');

    superagent.del('/').end(function(err, res) {
      expect(res.method).to.equal('DELETE');
      done();
    });
  });

  describe('multiple urls', function(done) {
    var expected = {
      responseText: {hi: 'back'},
      status: 200
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
        expect(res.xhr).to.deep.equal(expected);
        done();
      });
    });

    it('mocks the second route', function(done) {
      superagent.put('/route-two').end(function(err, res) {
        res.xhr.responseText = JSON.parse(res.xhr.responseText);
        expect(res.xhr).to.deep.equal(expected);
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
