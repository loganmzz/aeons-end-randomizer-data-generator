const spreadsheetId = '1yxFwi77V6qzQ9xEKKIXkAWe9R7oBgnpphvoBRfpLcnA';

const fs = require('fs');
const {google} = require('googleapis');

const data = {
    spreadsheets: null,
    raw: {
        expansions: null
    }
};

class RawExpansion {
    constructor([originalName, translatedName, id, type]) {
        this.originalName   = originalName;
        this.translatedName = translatedName;
        this.id             = id;
        this.type           = type;

        this.nemesis  = [];
        this.mages    = [];
        this.starters = [];
        this.cards    = [];
    }
}

new Promise((resolve, reject) => {
    fs.readFile('api_key.txt', (error, content) => {
        if (error) reject(error);
        else       resolve(content);
    });
})
    .then(buffer      => buffer.toString())
    .then(auth => {
        data.spreadsheets = google.sheets('v4').spreadsheets;
        return data.spreadsheets.values.get({auth, spreadsheetId, range: 'Expansions'});
    })
    .then(expansions => {
        data.raw.expansions = expansions.data.values.filter((_, i) => i != 0).map(data => new RawExpansion(data));
        console.log(data.raw);
    })
    .catch(error => console.error(error));
