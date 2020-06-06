const lang='FR';
const outdir = `./DATA/${lang}`;


const fs = require('fs');

class StringBuilder {
    constructor() {
        this.content = '';
    }

    ln() {
        return this.str('\n');
    }

    str(data) {
        this.content += data;
        return this;
    }

    json(data, indent) {
        const json = JSON.stringify(data, null, 2);
        if (!indent) {
            return this.str(json);
        }
        json.split('\n').map(ln => ln ? indent + ln : ln).forEach((ln, i, array) => {
            this.str(ln);
            if (i < array.length-1) this.ln();
        });
        return this;
    }

    toString() {
        return this.content;
    }
}

const ld = {
    expansionDirname: expansion => {
        let name = expansion.originalName;
        let fstLetter = name[0].toLowerCase();
        let remainder = name.slice(1).replace(/[' ]/g, '');
        return `${fstLetter}${remainder}`;
    },
    expansionDir: expansion => `${outdir}/${ld.expansionDirname(expansion)}`,
    rootIndex: expansions => {
        const file = `${outdir}/index.ts`;
        console.log(`[LOAD] Generate ${file}`);

        const content = new StringBuilder();

        content.str('import { IExpansionData } from \'aer-types\'').ln().ln();

        expansions.forEach(e => {
            content.str('import { ')
                   .str(e.id.toLowerCase())
                   .str('Data } from \'./')
                   .str(ld.expansionDirname(e))
                   .str('\'')
                   .ln();
        });

        content.ln().str('const ').str(lang).str(': IExpansionData = {').ln();
        expansions.forEach(e => content.str(`  ${e.id}: ${e.id.toLowerCase()}Data,`).ln());
        content
            .str('}').ln()
            .ln()
            .str('export default ').str(lang).ln();

        fs.writeFileSync(file, content);
    },
    expansions: expansions => {
        fs.mkdirSync(outdir, {recursive: true});
        ld.rootIndex(expansions);
        expansions.forEach(ld.expansion);
    },
    expansion: expansion => {
        fs.mkdirSync(`${ld.expansionDir(expansion)}`, {recursive: true});
        ld.expansionIndex(expansion);
        ld.nemeses(expansion, expansion.nemeses);
        ld.mages(expansion, expansion.mages);
        ld.cards(expansion, expansion.cards);
        ld.basicNemesisCards(expansion, expansion.basicNemesisCards);
    },
    expansionIndex: e => {
        const file = `${ld.expansionDir(e)}/index.ts`;
        console.log(`[LOAD] Generate ${file}`);

        const content = new StringBuilder();

        content.str('import { IExpansion } from \'aer-types\'').ln().ln();

        content.str('import { nemeses } from \'./nemeses\'').ln();
        content.str('import { mages } from \'./mages\'').ln();
        content.str('import { cards } from \'./cards\'').ln();
        content.str('import { basicNemesisCards } from \'./basicNemesisCards\'').ln();
        content.ln();

        content.str(`export const ${e.id.toLowerCase()}Data: IExpansion = {`).ln()
               .str(`  id: ${JSON.stringify(e.id)},`).ln()
               .str(`  name: ${JSON.stringify(e.name)},`).ln()
               .str(`  type: ${JSON.stringify(e.type)},`).ln()
               .str('  nemeses,').ln()
               .str('  mages,').ln()
               .str('  cards,').ln()
               .str('  basicNemesisCards,').ln()
               .str('}').ln()

        fs.writeFileSync(file, content);
    },
    nemeses: (e, nemeses) => {
        const file = `${ld.expansionDir(e)}/nemeses.ts`;
        console.log(`[LOAD] Generate ${file}`);

        const content = new StringBuilder();

        content.str('import { Nemesis } from \'aer-types\'').ln().ln()
               .str('export const nemeses: Nemesis[] = [').ln();
        nemeses.forEach(nemesis => content.json(nemesis, '  ').str(',').ln());
        content.str(']').ln();

        fs.writeFileSync(file, content);
    },
    mages: (e, mages) => {
        const file = `${ld.expansionDir(e)}/mages.ts`;
        console.log(`[LOAD] Generate ${file}`);

        const content = new StringBuilder();

        content.str('import { Mages } from \'aer-types\'').ln().ln()
               .str('export const mages: Mages[] = [').ln();
        mages.forEach(mage => content.json(mage, '  ').str(',').ln());
        content.str(']').ln();

        fs.writeFileSync(file, content);
    },
    cards: (e, cards) => {
        const file = `${ld.expansionDir(e)}/cards.ts`;
        console.log(`[LOAD] Generate ${file}`);

        const content = new StringBuilder();

        content.str('import { ICard } from \'aer-types\'').ln().ln()
               .str('export const cards: ICard[] = [').ln();
        cards.forEach(card => content.json(card, '  ').str(',').ln());
        content.str(']').ln();

        fs.writeFileSync(file, content);
    },
    basicNemesisCards: (e, basicNemesisCards) => {
        const file = `${ld.expansionDir(e)}/basicNemesisCards.ts`;
        console.log(`[LOAD] Generate ${file}`);

        const content = new StringBuilder();

        content.str('import { BasicNemesisCard } from \'aer-types\'').ln().ln()
               .str('export const basicNemesisCards: BasicNemesisCard[] = [').ln();
        basicNemesisCards.forEach(card => content.json(card, '  ').str(',').ln());
        content.str(']').ln();

        fs.writeFileSync(file, content);
    },
}

module.exports = expansions => {
    console.log(`[LOAD] Start`);
    ld.expansions(expansions);
    console.log(`[LOAD] End`);
    return undefined;
};
