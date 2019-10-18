import puppeteer from 'puppeteer';
import config from '../config';
import slugify from 'slugify';

const runBrowser = async () => {
    const browser = await puppeteer.launch(config.puppeteerConfig());
    const page = await browser.newPage();
    return {browser, page};
}

const getScreenshot = async (dirName, templateFile) => {
    const templatesPath = `${process.env.PWD}/templates/`;
    const fullIndexPath = `${templatesPath}${dirName}/${templateFile}`;
    const imageFile = `${slugify(dirName)}.png`;
    const imagePath = `${templatesPath}/screenshots/${imageFile}`;
    const {browser, page} = await runBrowser();
    await page.goto(`file://${fullIndexPath}`);

    await page.screenshot({path: imagePath, fullPage: true});
    await browser.close();

    return imageFile;
}

export {getScreenshot};
