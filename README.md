# mockagent

[![Build Status](https://travis-ci.org/kahnjw/mockagent.png)](https://travis-ci.org/kahnjw/mockagent)

A mocking utility for [superagent](https://github.com/visionmedia/superagent) in
the browser. If you are using Node.js
[shmock](https://github.com/xetorthio/shmock) is recommended.

## Usage

```javascript
var superagent = require('superagent');
var mockagent = require('mockagent');

mockagent.target(superagent);

// Make a simply static mock
mockagent.put('/url/to/fake', 201, {data: 'to return'});

superagent.put('/url/to/fake')
// ...

// For more complex mocks, use a function to create the response.
// This function is bound to the superagent Request instance, making
// it possible to check headers, request body, etc.
mockagent.post('/post/url', function(res) {

  if (this.header['Accept'] === 'application/json') {
    res.xhr = {responseText: '...'};
  } else {
    // ...
  }

  return res;
});

// To tear down the mock
mockagent.releaseTarget();
```

Mockagent can take a single URL to mock, or an array of URLs. The response
can be given as an object, or a string. If it is given as an object, it will
be serialized to a JSON string before being returned.

## Development

Pull it down

```sh
$ git clone https://github.com/kahnjw/mockagent.git
$ cd mockagent
```

Test it

```
$ npm test
```

Make pulls against the github repository.

Happy testing!
