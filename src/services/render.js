import {templatesPath, renderPath} from '../config';
import {db} from '../lib/db';
import fse from 'fs-extra';
import fs from 'fs';
import archiver from 'archiver';
import ejs from 'ejs';

export default async (order) => {
    const template = await db.templates.random();
    const files = template.files2render;

    // await fse.copy(`${templatesPath}/${template.templatePath}`, `${renderPath}/${template.templatePath}`);

    const output = fs.createWriteStream(`${renderPath}/example.zip`);
    const archive = archiver('zip', {
        zlib: { level: 3 } // Sets the compression level.
    });

    output.on('end', function() {
        console.log('Data has been drained');
    });

    archive.on('entry', () => {
        console.log('asfsfwerfgwre');
    })

    archive.pipe(output);
    await archive.directory(`${templatesPath}/${template.templatePath}`, false);
    console.log(1);

    const renderData = (input) => {
        return order.data[input].text;
    }

    for (const file of files) {
        const filePath = `${templatesPath}/${template.templatePath}/${file}`;
        const renderedFile = await ejs.renderFile(filePath, {data: renderData, test: 'dfsdfsd'}, {async: true});

        console.log(renderedFile);
        archive.append(renderedFile, { name: file });
    }
    archive.finalize();

    return;
}