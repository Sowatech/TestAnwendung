import { browser, by, element, ElementFinder, protractor, ProtractorBrowser } from 'protractor';

import { SwtGridPageHelper } from './swt-grid.poh';

export class DialogPageHelper {
    constructor(private nonDefaultBrowser: ProtractorBrowser = null) {}

    get browser(): ProtractorBrowser {
        return this.nonDefaultBrowser ? this.nonDefaultBrowser : browser;
    }

    public grid: SwtGridPageHelper;

    public async fillAndSubmit(dto: Object, submit: boolean = true) {
        await this.waitForDialogIsVisible();
        for (let fieldname in dto) {
            await this.root
                .element(by.css(`[name="${fieldname}"]`))
                .getWebElement()
                .getTagName()
                .then(async tagName => {
                    switch (tagName) {
                        case "input":
                            this.fillInput(fieldname, dto);
                            break;
                        case "select":
                            await this.fillSelect(fieldname, dto);
                            break;
                        case "textarea":
                            this.fillTextarea(fieldname, dto);
                            break;
                        case "swt-checkbox":
                            await this.selectCheckbox(fieldname, dto);
                            break;
                        case "ng-select":
                            await this.selectMultiSelect(fieldname, dto);
                            break;
                        default:
                            throw "DialogPageHelper.fillAndSubmit: " + tagName + " not implemented.";
                    }
                });
        }
        if (submit) await this.closeWithOk();
    }

    public async isFilledWith(dto: Object): Promise<boolean> {
        await this.waitForDialogIsVisible();
        let success = true;
        for (let fieldname in dto) {
            let input = await this.getInput(fieldname);
            let value = await input.getText();
            if (value != dto[fieldname]) {
                success = false;
                break;
            }
        }
        await this.closeWithCancel();
        return success;
    }

    private get root(): ElementFinder {
        //return element(by.css("swt-generic-edit-dialog .modal-dialog"));
        return this.browser.element(by.css("#app-dialog > div > div.modal-dialog"));
    }

    private async getInput(fieldname: string): Promise<ElementFinder> {
        let cssLocator = `input[name="${fieldname}"]`;
        let input: ElementFinder = this.root.element(by.css(cssLocator));
        await input.clear();
        return input;
    }

    private getTextArea(fieldname: string): ElementFinder {
        let cssLocator = `textarea[name="${fieldname}"]`;
        let element: ElementFinder = this.root.element(by.css(cssLocator));
        element.clear();
        return element;
    }

    private getCheckbox(fieldname: string): ElementFinder {
        let cssLocator = `swt-checkbox[name="${fieldname}"]`;
        let element: ElementFinder = this.root.element(by.css(cssLocator));
        return element.element(by.tagName("input"));
    }

    public getSelect(fieldname: string): ElementFinder {
        let cssLocator = `select[name="${fieldname}"]`;
        return this.root.element(by.css(cssLocator));
    }

    public getGrid(gridElementId: string = null) {
        return this.grid.getGrid(gridElementId);
    }

    private async selectOption(input: ElementFinder, value: string | number) {
        let cssLocator = this.valueIsNullOrUndefinedOrEmtpy(value) ? `option` : `option[value="${value}"]`;
        let select = input.element(by.css(cssLocator));
        let selectVisible = await select.isPresent();
        if (!selectVisible && typeof (value) == "number") select = await input.all(by.tagName("option")).get(value);
        await select.click();
    }

    private valueIsNullOrUndefinedOrEmtpy(value: string | number) {
        return value == null || value == undefined || value == "";
    }

    private async getMultiSelectOptions(fieldname: string): Promise<any> {
        let cssLocator = `ng-select[name="${fieldname}"]`;
        let select: ElementFinder = this.root.element(by.css(cssLocator));
        await select.click();
        let cssLocatorOptions = `div[class="options"]`;
        let option: ElementFinder = this.root.element(by.css(cssLocatorOptions));
        return new Promise(resolve => {
            resolve(option.all(by.tagName("li")));
        });
    }

    public get btnOk(): ElementFinder {
        return this.root.element(by.css("#btn-ok"));
    }

    public get btnCancel(): ElementFinder {
        return this.root.element(by.css("#btn-cancel"));
    }

    public btnOptional(text: string): ElementFinder {
        return this.root.element(by.partialButtonText(text));
    }

    public async waitForDialogIsVisible() {
        return await this.browser.driver.wait(protractor.until.elementIsVisible(this.root.getWebElement()), 5000);
    }

    public async waitForDialogIsClosed() {
        return await this.browser.driver.wait(protractor.until.elementIsNotVisible(this.root.getWebElement()), 5000);
    }

    public async closeWithOk() {
        await this.btnOk.click();
        return await this.waitForDialogIsClosed();
    }

    public async closeWithCancel() {
        await this.btnCancel.click();
        return this.waitForDialogIsClosed();
    }

    private async fillInput(fieldname: string, dto: Object) {
        let input: ElementFinder;
        input = await this.getInput(fieldname);
        await input.sendKeys(dto[fieldname]);
    }

    private async fillSelect(fieldname: string, dto: Object) {
        await this.getSelect(fieldname).click();
        await this.selectOption(this.getSelect(fieldname), dto[fieldname]);
    }

    private fillTextarea(fieldname: string, dto: Object) {
        let input: ElementFinder;
        input = this.getTextArea(fieldname);
        input.sendKeys(dto[fieldname]);
    }

    private async selectCheckbox(fieldname: string, dto: Object) {
        let input: ElementFinder = this.getCheckbox(fieldname);
        return input.isSelected().then(async isChecked => {
            if (dto[fieldname] && !isChecked) {
                return await input.click();
            } else {
                if (isChecked) return await input.click();
            }
        });
    }

    private async selectMultiSelect(fieldname: string, dto: Object) {
        let value: string = dto[fieldname];
        let options: ElementFinder[] = await this.getMultiSelectOptions(fieldname);
        let li;
        if (this.valueIsNullOrUndefinedOrEmtpy(value) && options.length > 0) li = options[0];
        else {
            for (let index = 0; index < options.length; index++) {
                let text = await options[index].getText();
                if (text == value) li = options[index];
            }
        }
        if (li) return await li.click();
    }

    public async selectFirstOption(element: ElementFinder) {
        await this.waitForDialogIsVisible();
        return await element
            .all(by.tagName("option"))
            .first()
            .click();
    }

    public async conditionalSelectFirstOption(fieldnameFirstSelect: string, valueFirstSelect: string | number, fieldnameSecondSelect: string) {
        this.selectOption(this.getSelect(fieldnameFirstSelect), valueFirstSelect);
        let element = this.getSelect(fieldnameSecondSelect);
        await element.click();
        return await this.selectFirstOption(element);
    }

    public async selectTabNavByText(tabText): Promise<void> {
        let ul: ElementFinder = this.root.element(by.css(`ul[class="nav nav-tabs"]`));
        let allAnchorTags = await ul.all(by.tagName("a"));
        let resultTab: ElementFinder;
        for (let index = 0; index < allAnchorTags.length; index++) {
            const element: ElementFinder = allAnchorTags[index];
            let elementText: string = await element.getText();
            if (elementText == tabText) { resultTab = element; break; }
        }
        if(!resultTab)throw "Tabset: " + tabText+ " couldn't be found";
        return await resultTab.click();
    }
}
