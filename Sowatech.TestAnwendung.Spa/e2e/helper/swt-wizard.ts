import { browser, by, ElementFinder, ProtractorBrowser } from 'protractor';

export class SwtWizardHelper {
    constructor( private nonDefaultBrowser: ProtractorBrowser = null){}

    get browser(): ProtractorBrowser {
        return this.nonDefaultBrowser ? this.nonDefaultBrowser : browser;
    }

    private get root(): ElementFinder {
        return this.browser.element(by.tagName("swt-wizard"));
    }

    public get btnPrevious(): ElementFinder {
        return this.root.element(by.id("swt-wizard-previous"));
    }

    public get btnNext(): ElementFinder {
        return this.root.element(by.id("swt-wizard-next"));
    }

    public get btnFinish(): ElementFinder {
        return this.root.element(by.id("swt-wizard-finish"));
    }

    public get btnCancel(): ElementFinder {
        return this.root.element(by.id("swt-wizard-cancel"));
    }

    public get currentStepIdent() {
        return this.root.element(by.id("swt-wizard-step-ident")).getAttribute("name");
    }

    public get currentStepNumber() {
        return this.root.element(by.id("swt-wizard-step-number")).getAttribute("name");
    }

    public goToStepNumber(stepNumber: number) {
        return this.root.element(by.id("step_" + stepNumber));
    }

    public goToIdent(ident: string): ElementFinder {
        return this.root.element(by.css(`li[title="${ident}"]`));
    }

    public stepIsDisabled(stepNumber: number) {
        return this.root
            .element(by.id("step_" + stepNumber))
            .getAttribute("class")
            .then(res => res.includes("disabled"));
    }

    public get btnPreviousIsDisabled() {
        return this.root.element(by.id("swt-wizard-previous")) .getAttribute("class")
        .then(res => res.includes("disabled"));
    }

    public get btnNextIsDisabled() {
        return this.root.element(by.id("swt-wizard-next"))
        .getAttribute("class")
        .then(res => res.includes("disabled"));
    }

    public get btnFinishIsDisabled() {
        return this.root.element(by.id("swt-wizard-finish"))
        .getAttribute("class")
        .then(res => res.includes("disabled"));
    }
}
