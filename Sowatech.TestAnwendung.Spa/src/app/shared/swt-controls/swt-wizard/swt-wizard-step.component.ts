import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'swt-wizard-step',
    template:   `
        <div [style.display]="step.current?'block':'none'">
            <h1 tabindex="-1" class="title">{{step.title}}</h1>
            <div role="tabpanel">
                <ng-content></ng-content>
            </div>
        <div>
`
})


export class WizardStepComponent implements OnInit, OnDestroy {

    constructor(
    ) {
    }

    private subscriptions = new Array<Subscription>();
    ngOnInit() {
        this.subscriptions.push(
        );
    }

    ngOnDestroy() {
        for (const s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    public step: WizardStep = new WizardStep("(no title)");

    @Input('ident') set setIdent(value: string) {
        if (value) this.step.ident = value;
    }

    @Input('title') set setTitle(value: string) {
        if (value) this.step.title = value;
    }

    @Input('number') set setNumber(value: string) {
        if (value) this.step.number = value;
    }

    @Input('canFinish') set setCanFinish(value: boolean) {
        if (value) this.step.canFinish = value;
    }

    @Input('last') set setLast(value: boolean) {
        if (value) this.step.last = value;
    }

    @Input('first') set setFirst(value: boolean) {
        if (value) this.step.first = value;
    }

    @Input('canCancel') set canCancel(value: boolean) {
        if (typeof(value) === "boolean")  this.step.canCancel = value;
    }
}

export class WizardStep {

    constructor(title: string) {
        this.title = title;
    }

    title: string;
    ident: string;
    number?: string;

    get class(): string {
        let classes = new Array<string>();
        if (this.disabled) classes.push("disabled");
        if (this.current) classes.push("current");
        if (this.hidden) classes.push("hidden");
        if (this.done) classes.push("done");
        if (this.first) classes.push("first");
        if (this.last) classes.push("last");
        if (this.error) classes.push("error");
        return classes.join(" ");
    };

    disabled: boolean = false;
    current: boolean = false;
    done: boolean = false;
    hidden: boolean = false;
    error: boolean = false;

    private _first: boolean = false;
    public set first(value: boolean) {
        this._first = value;
        if (this._first) this.canLeaveToPrevious = false;
    }

    public get first(): boolean {
        return this._first;
    }

    private _last: boolean = false;
    public set last(value: boolean) {
        this._last = value;
        if (this._last) {
            this.canLeaveToNext = false;
            this.canFinish = true;
        }
    }

    public get last(): boolean {
        return this._last;
    }

    canFinish: boolean = false;
    canLeaveToNext: boolean = true;
    canLeaveToPrevious: boolean = true;
	canCancel: boolean = true;
}
