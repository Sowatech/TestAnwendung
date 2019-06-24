import { browser, element, by, ElementFinder, protractor } from 'protractor';

const until = protractor.ExpectedConditions;

export class MessageBoxPageHelper {

    private get root(): ElementFinder {
        return element(by.css("ion-alert .alert-wrapper"));
    }

    public get btnOk(): ElementFinder {
        return this.root.element(by.className("alert-result-ok"));
    }

    public get btnCancel(): ElementFinder {
        return this.root.element(by.className("alert-result-cancel"));
    }

    public get modalBackdrop(): ElementFinder {
        return this.root.element(by.css("bs-modal-backdrop .modal-backdrop"));
    }

    // public async clickButton(index: number = 0) {
    //     //keine Unterschiede in den einzelnen Buttons. Daher wird über die Reihenfolge gegangen
    //     let buttons = this.root.all(by.css('button[ion-button="alert-button"]'));
    //     await browser.sleep(500);
    //     await buttons.get(index).click();
    //     await this.waitForDialogIsClosed();
    // }

    // public async clickLastButton() {
    //     let buttons = this.root.all(by.css('button[ion-button="alert-button"]'));
    //     let count = await buttons.count();
    //     await browser.sleep(500);
    //     await buttons.get(count - 1).click();
    //     await this.waitForDialogIsClosed();
    // }

    public async waitForDialogIsVisible() {
        return await browser.wait(until.presenceOf(this.root));
    }

    public async waitForDialogIsClosed() {
        return await browser.wait(until.not(until.presenceOf(this.root)));
    }

    public async closeWithOk() {
        await browser.sleep(500);
        await this.btnOk.click();
        return this.waitForDialogIsClosed();
    }

    public async closeWithCancel() {
        await browser.sleep(500);
        await this.btnCancel.click();
        return this.waitForDialogIsClosed();
    }
}
