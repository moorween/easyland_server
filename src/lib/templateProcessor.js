import puppeteer from 'puppeteer';
import config from '../config';

const runBrowser = async () => {
    const browser = await puppeteer.launch(config.puppeteerConfig());
    const page = await browser.newPage();
    return {browser, page};
}

const getScreenshot = async (dirName, templateFile, imageFile) => {
    try {
        const templatesPath = `${process.env.PWD}/templates/`;
        const fullIndexPath = `${templatesPath}${dirName}/${templateFile}`;
        const imagePath = `${templatesPath}/screenshots/${imageFile}`;
        const {browser, page} = await runBrowser();
        await page.goto(`file://${fullIndexPath}`);

        await page.screenshot({path: imagePath, fullPage: true});
        await browser.close();

        return imageFile;
    } catch (err) {
        console.error(err);
    }

}

export {getScreenshot};
