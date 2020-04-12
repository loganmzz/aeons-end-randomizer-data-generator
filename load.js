const outdir = './DATA/FR';

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

    toString() {
        return this.content;
    }
}

const ld = {
    rootIndex: expansions => {
        const file = `${outdir}/index.ts`;
        console.log(`[LOAD] Generate ${file}`);

        const content = new StringBuilder();

        content.str('import { IExpansionData } from \'../../types\'').ln().ln();

        expansions.forEach(e => {
            content.str('import { ')
                   .str(e.id.toLowerCase())
                   .str('Data } from \'./')
                   .str(e.id.toLowerCase())
                   .str('\'')
                   .ln();
        });

        content.ln().str('export const DATA: IExpansionData = {').ln();
        expansions.forEach(e => {
            content.str('  ')
                   .str(e.id)
                   .str(': ')
                   .str(e.id.toLowerCase())
                   .str('Data,')
                   .ln();
        });
        content.str('}').ln();

        fs.writeFileSync(file, content);
    }
}

module.exports = expansions => {
    console.log(`[LOAD] Start`);
    fs.mkdirSync(outdir, {recursive: true});

    ld.rootIndex(expansions);

    console.log(`[LOAD] End`);
    return undefined;
};
