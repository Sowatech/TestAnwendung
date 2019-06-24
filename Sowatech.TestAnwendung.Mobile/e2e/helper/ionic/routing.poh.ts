import { browser, element, by, ElementFinder, protractor } from 'protractor';

const until = protractor.ExpectedConditions;

export class RoutingPageHelper {

    constructor(private passwords: { [username: string]: string }) {
        if (!passwords) {
            this.passwords =
                {
                    SysAdmin: "Abcd1234!",
                    TestClientAdmin: "Abcd1234!",
                    TestUser: "Abcd1234!"
                }
        }
    }

    // Zwischen Browser- und Device-Konfiguration kann z.B. danach unterschieden werden,
    // ob die baseUrl gesetzt ist (Browser ja, Device nein).
    private get isRunningInBrowser(): boolean {
        return browser.baseUrl != undefined && browser.baseUrl != '';
    }

    public async reload() {
        if (this.isRunningInBrowser) {
            await browser.get('');
        } else {
            await browser.driver.navigate().refresh();
        }
    }

    private animationFinished(timeout: number = 500) {
        //leider bislaneg keine moeglichkeit gefudnen wirklich zu warten auf ende
        //der "timeout" ist also aktuell kein wirklicher timeout sondern einfach die sleep zeit in ms
        return browser.sleep(timeout);
    }

    private async goToTestPage() {
        await this.reload();
        let menuButton = element(by.css("button[menutoggle]"));
        await this.waitUntilElementIsPresent(menuButton);
        await this.waitForClickBlock();
        await menuButton.click();
        let testButton = element(by.id("btn_test"));
        await this.waitUntilElementIsPresent(testButton);
        await this.animationFinished();
        await testButton.click();
    }

    public async loginAs(username: string) {
        await this.reload();
        await this.logOut();
        await element(by.css("#username > input")).sendKeys(username);
        await element(by.css("#password > input")).sendKeys(this.passwords[username]);
        await element(by.id("btn_anmelden")).click();
        await this.waitUntilElementIsNotPresent(element(by.tagName("login-page")));
    }

    public async logOut() {
        let loginPage = element(by.tagName("login-page"));
        let isOnLoginPage = await loginPage.isPresent();
        if (!isOnLoginPage) {
            await this.goToTestPage();
            await this.animationFinished();
            let LogOutButton = element(by.id("btn_logout"));
            await LogOutButton.click();
            // await this.reload();
            await this.waitUntilElementIsPresent(loginPage);
        }
    }

    public async waitUntilElementIsPresent(elem: ElementFinder, timeout: number = 5000) {
        await browser.wait(until.presenceOf(elem), timeout);
    }

    public async waitUntilElementIsNotPresent(elem: ElementFinder, timeout: number = 5000) {
        await browser.wait(until.not(until.presenceOf(elem)), timeout);
    }

    public async waitUntilBackdropIsNotPresent(timeout: number = 5000) {
        // click-block verhindert das drücken des Buttons       
        // click block leider immer sichtbar, aendert nur z-index, schwer abzufragen
        await browser.sleep(500);
    }

    public async waitForClickBlock(timeout: number = 5000) {
        let clickBlock = element(by.css("div.click-block.click-block-active"));
        await this.waitUntilElementIsNotPresent(clickBlock, timeout);
    }

    public async navigate(componentName: string, params: { key: string, value: string }[] = null) {
        await this.goToTestPage();
        let pageInput = await element(by.id("input_page"));
        await pageInput.sendKeys(componentName);
        if (params) {
            let paramsAsString = JSON.stringify(params);
            let paramInput = await element(by.id("input_param"));
            paramInput.sendKeys(paramsAsString);
        }
        let navigateButton = await element(by.id("btn_navigate"));
        await this.waitUntilBackdropIsNotPresent();
        await navigateButton.click();
        await this.waitUntilElementIsNotPresent(navigateButton);
        await this.waitUntilLoadingDone();
    }

    public async waitUntilLoadingDone() {
        await this.waitUntilElementIsNotPresent(element(by.className("loading-wrapper")));
    }
}
