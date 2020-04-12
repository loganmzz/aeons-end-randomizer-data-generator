const auth    = require('./auth');
const extract = require('./extract');
const transform = require('./transform');

auth.read()
    .then(extract)
    .then(transform)
    .then(data => {
        console.log('data', data);
    })
    .catch(error => console.error(error));
