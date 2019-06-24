import { browser, by, element, ElementFinder, ProtractorBrowser } from 'protractor';

export class SwtGridPageHelper {
    constructor( private nonDefaultBrowser: ProtractorBrowser = null){}

    get browser(): ProtractorBrowser {
        return this.nonDefaultBrowser ? this.nonDefaultBrowser : browser;
    }

    public getGrid(gridElementId: string = null): ElementFinder {
        return gridElementId ? this.browser.element(by.id(gridElementId)) : this.browser.element(by.tagName("swt-grid"));
    }

    private getGridElement(cssLocator: string, gridElementId: string = null): ElementFinder {
        let grid = this.getGrid(gridElementId);
        return grid.all(by.css(cssLocator)).first();
    }

    //gets row with given data-id attribute; if rowDataId==null then the result will be the first row
    public getRow(rowDataId: any = null, gridElementId: string = null): ElementFinder {
        let cssLocator = rowDataId ? `tr[data-id="${rowDataId}"]` : "tr[data-id]";
        let row = this.getGridElement(cssLocator, gridElementId);
        return row;
    }

    public getCheckbox(rowDataId: any = null, gridElementId: string = null) {
        let row = this.getRow(rowDataId, gridElementId);
        // let cssLocator = `input[class="ng-pristine ng-valid ng-touched"]`;
        let cssLocator = `input`;
        return row.element(by.css(cssLocator));
    }

    public async filterRows(fieldname: string, value: string | number, gridElementId: string = null) {
        let input: ElementFinder;
        await this.getGrid(gridElementId)
            .element(by.css(`thead input[ng-reflect-dsfilter="${fieldname}"]`))
            .isPresent()
            .then(exsist => {
                if (exsist) {
                    input = this.getInput(fieldname, gridElementId);
                    input.sendKeys(value);
                } else {
                    input = this.getSelect(fieldname, gridElementId);
                    this.selectOption(input, value);
                }
            });
    }

    private getInput(fieldname: string, gridElementId: string = null): ElementFinder {
        let cssLocator = `thead input[ng-reflect-dsfilter="${fieldname}"]`;
        let input: ElementFinder = this.getGridElement(cssLocator, gridElementId);
        input.clear();
        return input;
    }

    private getSelect(fieldname: string, gridElementId: string = null): ElementFinder {
        let cssLocator = `thead select[ng-reflect-dsfilter="${fieldname}"]`;
        let input: ElementFinder = this.getGridElement(cssLocator, gridElementId);
        return input;
    }

    private selectOption(input: ElementFinder, value: string | number) {
        let cssLocator = `option[ng-reflect-value="${value}"]`;
        input.element(by.css(cssLocator)).click();
    }

    public clearFilters(gridElementId: string = null) {
        let ctrl = this.getGridElement("ds-filterdisplay i", gridElementId);
        ctrl.click();
    }

    public async sortAsc(fieldname: string, gridElementId: string = null) {
        await this.sort(fieldname, "asc", gridElementId);
    }

    public async sortDesc(fieldname: string, gridElementId: string = null) {
        await this.sort(fieldname, "desc", gridElementId);
    }

    private async sort(fieldname: string, direction: "asc" | "desc" = "asc", gridElementId: string = null) {
        let ctrl = this.getGridElement(`th[ng-reflect-sort-field="${fieldname}"]`, gridElementId);

        let classValue = await ctrl.getAttribute("class");
        switch (direction) {
            case "asc":
                if (!classValue.includes("sorting_asc")) {
                    ctrl.click();
                }
                break;
            case "desc":
                if (classValue.includes("sorting_asc")) {
                    ctrl.click();
                } else if (!classValue.includes("sorting_desc")) {
                    //class="sorting" : springt beim ersten click auf asc, beim zweiten auf desc
                    ctrl.click();
                    ctrl.click();
                }
                break;
        }
    }

    public getRowButton(buttonIdent: string, rowDataId: any = null, gridElementId: string = null): ElementFinder {
        let cssLocator = buttonIdent ? `button[data-ident="${buttonIdent}"]` : "button[data-ident]";
        let row = this.getRow(rowDataId, gridElementId);
        return row.all(by.css(cssLocator)).first();
    }

    public checkCreated(fieldname: string, value: string | number, gridElementId?: string) {
        this.checkExists(fieldname, value, gridElementId);
    }

    public checkEdited(fieldname: string, value: string | number, gridElementId?: string) {
        this.checkExists(fieldname, value, gridElementId);
    }

    private checkExists(fieldname: string, value: string | number, gridElementId?: string) {
        this.filterRows(fieldname, value, gridElementId);
        let span = this.getGrid()
            .all(by.css("td > span"))
            .first();
        expect(span.isPresent()).toBe(true);
    }

    public checkDeleted(fieldname: string, value: string | number, gridElementId?: string) {
        this.filterRows(fieldname, value, gridElementId);
        let span = this.getGrid()
            .all(by.css("td > span"))
            .first();
        expect(span.isPresent()).toBe(false);
    }

    public async scrollX(element: ElementFinder): Promise<{}>;
    public async scrollX(posPixel: number): Promise<{}>;
    public async scrollX(arg: number | ElementFinder): Promise<{}> {
        let x = 0;
        if (typeof arg === "number") {
            let posPixel: number = arg;
            x = posPixel;
        } else {
            let element: ElementFinder = arg;
            let location = await element.getLocation();
            x = location.y;
        }
        let script = `window.scrollTo(${x},0)`;
        return this.browser.executeScript(script);
    }
}
