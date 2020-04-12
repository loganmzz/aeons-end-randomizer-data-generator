const spreadsheetId = '1yxFwi77V6qzQ9xEKKIXkAWe9R7oBgnpphvoBRfpLcnA';

const fs = require('fs');
const {google} = require('googleapis');

const data = {
    gapi: {
        auth: null,
    },
    raw: [],
};


class SheetType {
    constructor(name, property, from_row) {
        this.name     = name;
        this.property = property;
        this.from_row = from_row;
    }

    sheetName(expansion) {
        return `${expansion.id} - ${this.name}`;
    }

    apply_row(expansion, row) {
        const entity = this.from_row(row);
        const collection = expansion[this.property];
        collection.push(entity);
    }
}
const SheetTypes = {
    Nemesis:  new SheetType('Nemesis', 'nemesis' , row => new RawNemesis(row)),
    Mages:    new SheetType('Mages'  , 'mages'   , row => new RawMage(row)),
    Starters: new SheetType('Départ' , 'starters', row => new RawCard(row)),
    Cards:    new SheetType('Cartes' , 'cards'   , row => new RawCard(row)),

    all: function() {
        return [this.Nemesis, this.Mages, this.Starters, this.Cards];
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

class RawNemesis {
    constructor([originalName, translatedName, id, health, difficulty, expeditionRating, additionalInformation]) {
        this.originalName          = originalName;
        this.translatedName        = translatedName;
        this.id                    = id;
        this.health                = health;
        this.difficulty            = difficulty;
        this.expeditionRating      = expeditionRating;
        this.additionalInformation = additionalInformation;
    }
}

class RawMage {
    constructor([originalName, translatedName, id, title, ability, charge, startersId]) {
        this.originalName   = originalName;
        this.translatedName = translatedName;
        this.id             = id;
        this.title          = title;
        this.ability        = ability;
        this.charge         = charge;
        this.startersId     = startersId;
    }
}

class RawCard {
    constructor([originalName, translatedName, id, type, cost, effect]) {
        this.originalName   = originalName;
        this.translatedName = translatedName;
        this.id             = id;
        this.type           = type;
        this.cost           = cost;
        this.effect         = effect;
    }
}

class RawSheetDescription {
    constructor(expansion, type) {
        this.expansion = expansion;
        this.type      = type;
    }

    extract(gapisheet) {
        gapisheet.data.values.filter((_, i) => i != 0).forEach(row => this.type.apply_row(this.expansion, row));
        return this;
    }

    name() {
        return this.type.sheetName(this.expansion);
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
        data.gapi.auth = auth;
        return google.sheets('v4').spreadsheets.values.get({auth, spreadsheetId, range: 'Expansions'});
    })
    .then(expansions => {
        data.raw = expansions.data.values.filter((_, i) => i != 0).map(data => new RawExpansion(data));
        return data.raw.flatMap(e => SheetTypes.all().map(type => new RawSheetDescription(e, type)));
    })
    .then(sheets => {
        return Promise.all(
            sheets.map(sheet => google.sheets('v4').spreadsheets.values.get({auth: data.gapi.auth, spreadsheetId, range: sheet.name()})
                                                                       .catch(e => {
                                                                           if (e.response.data.error.status != 'INVALID_ARGUMENT') {
                                                                               console.error(e.response.data);
                                                                           }
                                                                           return null;
                                                                       })
                                                                       .then(gapisheet => gapisheet != null ? sheet.extract(gapisheet) : null)
            )
        );
    })
    .then(sheets => {
        console.log(data.raw);
    })
    .catch(error => console.error(error));