import { protractor, browser, element, by, ElementFinder } from 'protractor';
import { TestUserAuth } from "./app/test-user-auth";
import { LogsPageHelper, ILogs } from './helper/logs.poh';
import { RoutingPageHelper } from './helper/ionic/routing.poh';
import { MessageBoxPageHelper } from './helper/ionic/message-box.poh';

const until = protractor.ExpectedConditions;

export abstract class IonicBasePage {
    constructor(protected rootElementTagName: string) {

    }

    private logsHelper = new LogsPageHelper();
    public messageBoxHelper = new MessageBoxPageHelper();
    public routing = new RoutingPageHelper(TestUserAuth.usersAndPasswords);

    public get logs(): ILogs {
        return this.logsHelper.logs;
    }

    public async reload() {
      await this.routing.reload();
    }

    async navigateTo(componentName: string, params: { key: string, value: string }[] = null) {
        await this.routing.navigate(componentName, params);
    }

    protected get rootElement(): ElementFinder {
        return element(by.tagName(this.rootElementTagName));
    }

    public async waitForPageIsPresent() {
        await browser.wait(until.presenceOf(this.rootElement));
    }

    public async pageIsVisible() {
        return await browser.isElementPresent(this.rootElement);
    }

    public async waitForElementIsVisible(elem: ElementFinder) {
        await browser.wait(until.presenceOf(elem));
    }

    public async scrollY(element: ElementFinder);
    public async scrollY(posPixel: number);
    public async scrollY(arg: number | ElementFinder) {
        let y = 0;
        if (typeof arg === "number") {
            let posPixel: number = arg;
            y = posPixel;
        }
        else {
            let element: ElementFinder = arg;
            let location = await (element).getLocation();
            y = location.y;
        }
        let script = 'window.scrollTo(0,' + y + ')'
        return browser.executeScript(script)
    }

    public async waitUntilLoadingDone() {
        await this.routing.waitUntilLoadingDone();
    }
}
