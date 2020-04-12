const auth    = require('./auth');
const extract = require('./extract');

auth.read()
    .then(extract)
    .then(data => {
        console.log('data', data);
    })
    .catch(error => console.error(error));
