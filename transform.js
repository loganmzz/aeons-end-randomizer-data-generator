// Model
class IExpansionData {}

class IExpansion {
    constructor({id, name, type, originalName, nemeses, mages, cards, basicNemesisCards}) {
        this.id                = id;
        this.name              = name;
        this.type              = type;
        this.originalName      = originalName;
        this.nemeses           = nemeses;
        this.mages             = mages;
        this.cards             = cards;
        this.basicNemesisCards = basicNemesisCards;
    }
}

class Nemesis {
    constructor({expansion, name, id, health, difficulty, additionalInfo, expeditionRating}) {
        this.expansion        = expansion;
        this.name             = name;
        this.id               = id;
        this.health           = health;
        this.difficulty       = difficulty;
        this.additionalInfo   = additionalInfo;
        this.expeditionRating = expeditionRating;
    }
}

class Mage {
    constructor({expansion, name, id, mageTitle, ability, numberOfCharges, uniqueStarters}) {
        this.expansion       = expansion;
        this.name            = name;
        this.id              = id;
        this.mageTitle       = mageTitle;
        this.ability         = ability;
        this.numberOfCharges = numberOfCharges;
        this.uniqueStarters  = uniqueStarters;
    }
}

class ICard {
    constructor({type, expansion, name, id, cost, effect, keywords}) {
        this.type      = type;
        this.expansion = expansion;
        this.name      = name;
        this.id        = id;
        this.cost      = cost;
        this.effect    = effect;
        this.keywords  = keywords;
    }
}

// Functions
const tx = {};

tx.expansions = (ctx, src) => {
    ctx.src.expansions = src;
    return src.map(e => tx.expansion(ctx, e));
};

tx.expansion = (ctx, src) => {
    ctx.src.expansion = src;
    return new IExpansion({
        id: src.id, name: src.translatedName, type: src.type,
        originalName: src.originalName,
        nemeses: src.nemeses.map(n => tx.nemesis(ctx, n)),
        mages: src.mages.map(m => tx.mage(ctx, m)),
        cards: src.cards.map(c => tx.card(ctx, c)),
        basicNemesisCards: []
    });
};

tx.nemesis = (ctx, src) => new Nemesis({
    expansion: ctx.src.expansion.id,
    name: src.translatedName,
    id: src.id,
    health: parseInt(src.health),
    difficulty: parseInt(src.difficulty),
    additionalInfo: src.additionalInformation || '',
    expeditionRating: parseInt(src.expeditionRating),
});

tx.mage    = (ctx, src) => new Mage({
    expansion: ctx.src.expansion.id,
    name: src.translatedName,
    id: src.id,
    mageTitle: src.title,
    ability: tx.mageAbility(src.ability),
    numberOfCharges: parseInt(src.charge),
    uniqueStarters: src.startersId.split('\n').map(id => tx.card(ctx, ctx.src.expansion.startersById()[id])),
});

tx.mageAbility = (src) => {
    const lines = src.split('\n');
    if (lines.length < 3) {
        return src;
    }
    let ability = `<h2>${lines[0]}</h2>\n<p class="ability-activation">${lines[1]}</p>\n<p>${lines[2]}`;
    if (lines.length == 4) {
        ability += `\n<span class="hint">${lines[3]}</span>`;
    }
    ability += '</p>';
    return ability;
}

tx.card    = (ctx, src) => new ICard({
    expansion: ctx.src.expansion.id,
    type: src.type,
    name: src.translatedName,
    id: src.id,
    cost: parseInt(src.cost),
    effect: tx.cardEffect(src),
    keywords: [],
});

tx.cardEffect = (card) => {
    let effect = '<p>\n';
    if (card.effect) {
        try {
            if (card.type == 'Spell') {
                const blocks = card.effect.split('---\n');

                let spellGeneral = '';
                let spellCast = '';
                switch (blocks.length) {
                    case 1:
                        spellCast = blocks[0];
                        break;
                    case 3:
                        spellGeneral = blocks[1];
                        spellCast = blocks[2];
                        break;
                    default:
                        console.error(`Invalid card effect for ${card.id}. Only two sections supported for Spell effect.`);
                        effect += tx.text(card.effect);
                }
                if (spellGeneral) {
                    effect += `${tx.text(spellGeneral)}<br/>\n`;
                }
                if (spellCast) {
                    effect += spellCast.split(/\nOU\n/g).map(sc => `<b>Lancer :</b> ${tx.text(sc)}`).join('\n<span class="or">OU</span>\n');
                }
            } else {
                effect += tx.text(card.effect);
            }
        } catch (e) {
            console.error(`Invalid card effect for '${card.id}'.`, e);
        }
    }
    effect += '\n</p>';
    return effect;
}

tx.text = (str) => str.replace(/\n/g, '<br/>\n').replace(/<br\/>\nOU<br\/>\n/g, '\n<span class="or">OU</span>\n').replace(/\$/g, '<span class="aether">&AElig;</span>');

module.exports = (expansions) => {
    console.log('[TRANSFORM] Start');
    const data = tx.expansions({src: {}}, expansions);
    console.log('[TRANSFORM] End');
    return data;
}