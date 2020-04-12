const auth      = require('./auth');
const extract   = require('./extract');
const transform = require('./transform');
const load      = require('./load');

auth.read()
    .then(extract)
    .then(transform)
    .then(load)
    .catch(error => console.error(error));
