import {templatesPath, renderPath} from '../config';
import {db} from '../lib/db';
import ejs from 'ejs';
import fs from 'fs';
import AdmZip from 'adm-zip';
import {getScreenshot} from "../lib/templateUtils";


export default class {
    constructor(order) {
        this._order = order;
        this._template = order.template;
    }

    renderData(input) {
        return (this._order.data[input] || {}).text;
    }

    async makeZip(outputName) {

        const files = this._template.files2render;
        const zip = new AdmZip();

        try {
            zip.addLocalFolder(`${templatesPath}/${this._template.templatePath}`, this._template.templatePath, (i) => {
                switch (true) {
                    case i[0] === '.':
                    case i.indexOf('/.') > -1:
                        return false;
                    default:
                        return true;
                }
            });

            for (const file of files) {
                const filePath = `${templatesPath}/${this._template.templatePath}/${file}`;
                const renderedFile = await ejs.renderFile(filePath,
                    {
                        data: this.renderData.bind(this),
                        test: 'test 111 ololo'
                    },
                    {async: true});
                zip.updateFile(`${this._template.templatePath}${file}`.replace(/\/+/g, '/'), renderedFile);
            }

            zip.writeZip(`${renderPath}/${outputName}.zip`);

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async makeScreenshot(imageFile) {
        const indexFile = `${templatesPath}/${this._template.templatePath}/${this._template.indexFile}`;
        const tmpFile = `${templatesPath}/${this._template.templatePath}/tmp.${this._template.indexFile}`;

        try {
            fs.copyFileSync(indexFile, tmpFile);

            const res = await getScreenshot(tmpFile, imageFile);

            fs.unlinkSync(tmpFile);

            return res;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}
