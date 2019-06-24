import { browser, by, ElementFinder, ProtractorBrowser } from 'protractor';

const NAV_ID_PREFIX = "nav_";
export class NavMenuPageHelper {
    constructor( private nonDefaultBrowser: ProtractorBrowser = null){}

    get browser(): ProtractorBrowser {
        return this.nonDefaultBrowser ? this.nonDefaultBrowser : browser;
    }

    public async navigateTo(path: string,timeout:number=5000) {
        let navItem = this.getItem(path);
        await navItem.click();
        await this.browser.wait(browser.ExpectedConditions.urlContains(path), timeout);
    }

    public getItem(path:string):ElementFinder {
        return this.browser.element(by.id(NAV_ID_PREFIX + path));
    }
}
