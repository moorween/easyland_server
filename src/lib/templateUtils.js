import puppeteer from 'puppeteer';
import {templatesPath, puppeteerConfig} from '../config';

const runBrowser = async () => {
    const browser = await puppeteer.launch(puppeteerConfig());
    const page = await browser.newPage();
    return {browser, page};
}

const getScreenshot = async (templateFile, imageFile) => {
    try {
        const {browser, page} = await runBrowser();
        await page.goto(`file://${templateFile}`);

        const result = await page.screenshot({path: imageFile, fullPage: true});
        await browser.close();

        return result;
    } catch (err) {
        console.error(err);
    }

}

export {getScreenshot};
