import { browser, by, element, ElementFinder, ProtractorBrowser } from 'protractor';

export class TabsHelper {
    constructor( private nonDefaultBrowser: ProtractorBrowser = null){}

    get browser(): ProtractorBrowser {
        return this.nonDefaultBrowser ? this.nonDefaultBrowser : browser;
    }

    public getTabSet(tabsetId: string = null): ElementFinder {
        return tabsetId ? this.browser.element(by.id(tabsetId)) : this.browser.element(by.tagName("tabset"));
    }

    public getTabNav(tabCustomClass: string, tabsetId: string = null): ElementFinder {
        let tabset = this.getTabSet(tabsetId);
        let cssSelector = "ul.nav-tabs li.nav-item." + tabCustomClass;
        return tabset.element(by.css(cssSelector));
    }
    public getTabNavByText(tabText: string): ElementFinder {
        let cssLocator = `tabset[class="tab-container"]`;
        let tabset = element(by.css(cssLocator));
        return tabset.element(by.partialLinkText(tabText));
    }

    public getActiveTabNav(tabsetId: string = null): ElementFinder {
        return this.getTabNav("active");
    }

    public getTabContent(tabCustomClass: string, tabsetId: string = null): ElementFinder {
        let tabset = this.getTabSet(tabsetId);
        let cssSelector = "tab-content tab." + tabCustomClass;
        return tabset.element(by.css(cssSelector));
    }

    public getActiveTabContent(tabsetId: string = null): ElementFinder {
        return this.getTabNav("active");
    }

    public isTabActive(tabCustomClass: string, tabsetId: string = null): boolean {
        let tab = this.getTabContent("active." + tabCustomClass);
        return tab != null && tab != undefined;
    }
}
