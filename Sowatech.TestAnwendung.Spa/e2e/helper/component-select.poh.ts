import { browser, by, ElementFinder, ProtractorBrowser } from 'protractor';

export class ComponentSelectHelper {
    constructor(private nonDefaultBrowser: ProtractorBrowser = null) {}

    get browser(): ProtractorBrowser {
        return this.nonDefaultBrowser ? this.nonDefaultBrowser : browser;
    }

    public grid: ComponentSelectHelper;

    async selectDropDownOption(dropDownId: string, optionText?: string): Promise<void> {
        let dropdown = this.browser.element(by.id(dropDownId));
        await dropdown.click();
        dropdown = this.browser.element(by.id(dropDownId));
        let options: ElementFinder[] = await this.loadDropDownOptions();
        let selectedOption;
        if (this.valueIsNullOrUndefinedOrEmtpy(optionText) && options.length > 0) selectedOption = options[0];
        else {
            for (let index = 0; index < options.length; index++) {
                let text = await options[index].getText();
                if (text == optionText) selectedOption = options[index];
            }
        }
        if (selectedOption) return await selectedOption.click();
        else {
            //option nicht vorhanden order wurde bereits selektiert
            return await dropdown.click();
        }
    }

    private async loadDropDownOptions(): Promise<any> {
        return new Promise(resolve => {
            resolve(this.browser.element.all(by.tagName("li")).all(by.css(`a.dropdown-item`)));
        });
    }

    private valueIsNullOrUndefinedOrEmtpy(value: string | number) {
        return value == null || value == undefined || value == "";
    }

    public async selectSwtCheckboxByElement(swtCheckboxElement: ElementFinder, check: boolean) {
        let input = swtCheckboxElement.element(by.tagName("input"));
        return await input.isSelected().then(async isChecked => {
            if (check && !isChecked) {
                return await input.click();
            } else {
                if (isChecked) return await input.click();
            }
        });
    }

    public async getElementByText(selectorType: "css" | "tagName", cssSelector: string, searchtext: string): Promise<ElementFinder> {
        let elements: ElementFinder[];
        if (selectorType == "css") elements = await this.browser.element.all(by.css(cssSelector));
        if (selectorType == "tagName") elements = await this.browser.element.all(by.tagName(cssSelector));
        let result: ElementFinder;
        for (let index = 0; index < elements.length; index++) {
            let text =await elements[index].getText();
            if (text == searchtext) result = elements[index];
        }
        return result;
    }
}
