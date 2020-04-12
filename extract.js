const spreadsheetId = '1yxFwi77V6qzQ9xEKKIXkAWe9R7oBgnpphvoBRfpLcnA';

const {google} = require('googleapis');

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
    Nemeses:  new SheetType('Nemesis', 'nemeses' , row => new RawNemesis(row)),
    Mages:    new SheetType('Mages'  , 'mages'   , row => new RawMage(row)),
    Starters: new SheetType('Départ' , 'starters', row => new RawCard(row)),
    Cards:    new SheetType('Cartes' , 'cards'   , row => new RawCard(row)),

    all: function() {
        return [this.Nemeses, this.Mages, this.Starters, this.Cards];
    }
};

class RawExpansion {
    constructor([originalName, translatedName, id, type]) {
        this.originalName   = originalName;
        this.translatedName = translatedName;
        this.id             = id;
        this.type           = type;

        this.nemeses  = [];
        this.mages    = [];
        this.starters = [];
        this.cards    = [];
    }

    startersById() {
        if (this.__startersById === undefined) {
            this.__startersById = {};
            this.starters.forEach(starter => { this.__startersById[starter.id] = starter; });
        }
        return this.__startersById;
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

module.exports = function(auth) {
    console.log('[EXTRACT] Start');

    const expansions = [];
    return google.sheets('v4').spreadsheets.values.get({auth, spreadsheetId, range: 'Expansions'})
                 .then(expansionSheet => {
                    expansions.push(...expansionSheet.data.values.filter((_, i) => i != 0).map(row => new RawExpansion(row)));
                    return expansions.flatMap(e => SheetTypes.all().map(type => new RawSheetDescription(e, type)));
                 })
                 .then(sheets => {
                    return Promise.all(
                        sheets.map(sheet => google.sheets('v4').spreadsheets.values.get({auth, spreadsheetId, range: sheet.name()})
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
                .then(_ => {
                    console.log('[EXTRACT] End');
                    return expansions
                });
};
