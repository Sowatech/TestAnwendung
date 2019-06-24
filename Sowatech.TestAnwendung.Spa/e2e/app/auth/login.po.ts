import { protractor, browser, element, by, ElementFinder } from 'protractor';
import { BasePage } from '../../base.po';

export class LoginPage extends BasePage {

    constructor() {
        super("login","login");
    }

    async getUserDisplay():Promise<ElementFinder> {
        let elem = element(by.id('displayName'));
        await browser.driver.wait(protractor.until.elementIsVisible(elem.getWebElement()));
        return elem;
    }
}
