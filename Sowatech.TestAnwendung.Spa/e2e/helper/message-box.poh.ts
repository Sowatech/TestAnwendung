import { browser, by, ElementFinder, protractor, ProtractorBrowser } from 'protractor';

export class MessageBoxHelper {
    constructor( private nonDefaultBrowser: ProtractorBrowser = null){}

    get browser(): ProtractorBrowser {
        return this.nonDefaultBrowser ? this.nonDefaultBrowser : browser;
    }

    private get root(): ElementFinder {
        return this.browser.element(by.css("message-box .modal-dialog"));
    }

    public get btnOk(): ElementFinder {
        return this.root.element(by.id("btn-ok"));
    }

    public get btnCancel(): ElementFinder {
        return this.root.element(by.id("btn-cancel"));
    }

    public get btnYes(): ElementFinder {
        return this.root.element(by.id("btn-yes"));
    }

    public get btnNo(): ElementFinder {
        return this.root.element(by.id("btn-no"));
    }

    public get btnClose(): ElementFinder {
        return this.root.element(by.id("btn-close"));
    }

    public get modalBackdrop(): ElementFinder {
        return this.root.element(by.css("bs-modal-backdrop .modal-backdrop"));
    }

    public async waitForDialogIsVisible() {
        return await this.browser.driver.wait(protractor.until.elementIsVisible(this.root.getWebElement()));
    }

    public async waitForDialogIsClosed() {
        return await this.browser.driver.wait(protractor.until.elementIsNotVisible(this.root.getWebElement()));
    }

    public async closeWithOk() {
        await this.btnOk.click();
        return this.waitForDialogIsClosed();
    }

    public async closeWithCancel() {
        await this.btnCancel.click();
        return this.waitForDialogIsClosed();
    }
}
