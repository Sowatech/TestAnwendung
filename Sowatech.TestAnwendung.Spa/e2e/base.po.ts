import { browser, by, element, ElementFinder, protractor, ProtractorBrowser } from 'protractor';

import { TestUserAuth } from './app/test-user-auth';
import { ComponentSelectHelper } from './helper/component-select.poh';
import { DialogPageHelper } from './helper/dialog.poh';
import { ILogs, LogsPageHelper } from './helper/logs.poh';
import { MessageBoxHelper } from './helper/message-box.poh';
import { NavMenuPageHelper } from './helper/nav-menu.poh';
import { RoutingPageHelper } from './helper/routing.poh';
import { SwtGridPageHelper } from './helper/swt-grid.poh';
import { SwtWizardHelper } from './helper/swt-wizard';
import { TabsHelper } from './helper/tabs.poh';

export abstract class BasePage {
    constructor(protected routingPath: string, protected rootElementTagName: string, private nonDefaultBrowser: ProtractorBrowser = null) {}

    get browser(): ProtractorBrowser {
        return this.nonDefaultBrowser ? this.nonDefaultBrowser : browser;
    }

    public navMenu = new NavMenuPageHelper(this.browser);
    public dialog = new DialogPageHelper(this.browser);
    public grid = new SwtGridPageHelper(this.browser);
    public wizard = new SwtWizardHelper(this.browser);
    public messageBox = new MessageBoxHelper(this.browser);
    public routing = new RoutingPageHelper(TestUserAuth.usersAndPasswords, this.browser);
    public tabs = new TabsHelper(this.browser);
    public componentSelect = new ComponentSelectHelper(this.browser);
    private logsHelper = new LogsPageHelper();

    public get logs(): ILogs {
        return this.logsHelper.logs;
    }

    async navigateTo(params?: (string | number)[]) {
        let commands = this.routing.createCommands(this.routingPath, params);
        await this.routing.navigate(commands);
        await this.waitForPageEnter(params);
    }

    private pageUrl: string; //Url of this page; is set by navigateTo

    public async waitForPageLeave(timeout: number = 5000) {
        await this.routing.waitUntilUrlChanged(this.pageUrl, timeout);
        this.pageUrl = "";
    }

    public async waitForPageEnter(params?: (string | number)[], timeout: number = 5000) {
        let url = this.getUrl(params);
        try {
            await this.routing.waitUntilUrlReached(url, timeout);
        } catch (error) {
            console.error(error.message);
        }
        this.pageUrl = await this.browser.getCurrentUrl();
    }

    public async setCurrentPageUrl() {
        this.pageUrl = await this.browser.getCurrentUrl();
    }

    protected get rootElement(): ElementFinder {
        return element(by.tagName(this.rootElementTagName));
    }

    public async waitForPageIsVisible() {
        await this.browser.driver.wait(protractor.until.elementIsVisible(this.rootElement.getWebElement()));
    }

    public async pageIsVisible() {
        return await this.browser.isElementPresent(this.rootElement);
    }

    public async waitForElementIsVisible(elem: ElementFinder) {
        await this.browser.driver.wait(protractor.until.elementIsVisible(elem.getWebElement()));
    }

    public getUrl(params?: (string | number)[]) {
        let commands = this.routing.createCommands(this.routingPath, params);
        return this.routing.getUrl(commands);
    }

    public async getCurrentUrl() {
        return await browser.getCurrentUrl();
    }

    public async scrollY(element: ElementFinder): Promise<{}>;
    public async scrollY(posPixel: number): Promise<{}>;
    public async scrollY(arg: number | ElementFinder): Promise<{}> {
        let y = 0;
        if (typeof arg === "number") {
            let posPixel: number = arg;
            y = posPixel;
        } else {
            let element: ElementFinder = arg;
            let location = await element.getLocation();
            y = location.y;
        }
        let script = "window.scrollTo(0," + y + ")";
        return this.browser.executeScript(script);
    }
}
