const fs = require('fs');

module.exports = {
    read: () =>
        new Promise((resolve, reject) => {
            fs.readFile('api_key.txt', (error, content) => {
                if (error) reject(error);
                else       resolve(content);
            });
        }).then(buffer      => buffer.toString())
};
