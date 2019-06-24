import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, ChangeDetectorRef, HostListener } from '@angular/core';

@Component({
    selector: 'swt-popover',
    moduleId: module.id,
    template: `
        <div #popover class="popover top in" role="tooltip" [style.display]="display" style="position:absolute">
            <div #arrow class="arrow"></div>
            <h3 class="popover-title" style="margin:0;font-weight:normal">{{title}}</h3>
            <div class="popover-content">
                <ng-content></ng-content>
            </div>
        </div>`
})

//http://getbootstrap.com/javascript/#popovers
export class SwtPopoverComponent {
    @Input() title: string;

    private placement: "top" | "bottom" | "left" | "right" = "top";
    @Input('placement') set setPlacement(value: "top" | "bottom" | "left" | "right") {
        this.popoverElement.classList.remove(this.placement);
        this.placement = value;
        this.popoverElement.classList.add(this.placement);
        this.setArrowStyle();
    }

    private trigger: "click" | "hover" | "focus" | "manual" = "click";
    @Input('trigger') set setTrigger(value: "click" | "hover" | "focus" | "manual") {
        this.removeEventListener();
        this.trigger = value;
        this.addEventListener();
    }

    private target: HTMLElement;
    @Input('target') set setTarget(value: HTMLElement) {
        this.removeEventListener();
        this.target = value;
        this.addEventListener();
    }


    private oldEvent: string = "";
    private popoverElement: HTMLElement;
    private arrowElement: HTMLElement;
    @ViewChild('arrow') arrow: HTMLElement;

    @ViewChild('arrow') set arrowRef(ref: ElementRef) {
        if (ref) this.arrowElement = ref.nativeElement;
    };

    @ViewChild('popover') set popoverRef(ref: ElementRef) {
        if (ref) this.popoverElement = ref.nativeElement;
    };

    private setArrowStyle() {
        switch (this.placement) {
            case "left":
                this.arrowElement.style.left = "50 %";
                break;
            case "right":
            default:
                this.arrowElement.style.top = "50 %";
                break;
        }
    }

    private currentEventListener: EventListener;

    private removeEventListener() {
        if (this.target && this.triggerEventName && this.currentEventListener) {
            this.target.removeEventListener(this.triggerEventName, this.currentEventListener);
        }
    }

    private addEventListener() {
        if (this.target && this.triggerEventName) {
            this.currentEventListener = () => { this.show(this.target) };
            this.target.addEventListener(this.triggerEventName, this.currentEventListener);
            //this.target.onmouseenter = (ev: MouseEvent) => { this.show(this.target) };
        }
    }

    private get triggerEventName(): string {
        let eventName: string = "";
        switch (this.trigger) {
            case "click":
                eventName = "click";
                break;
            case "focus":
                eventName = "focus";
                break;
            case "manual":
                eventName = null;
                break;
            case "hover":
            default:
                eventName = "mouseenter";
                break;
        }
        return eventName;
    }

    public get display(): string {
        return this.visible ? "block" : "none";
    }

    public visible: boolean;

    public show(target: HTMLElement = null) {
        var showTarget = target ? target : this.target;
        this.visible = true;
        this.calculatePosition();
        setTimeout(() => { this.hide() }, 1400);
    }

    public hide() {
        this.visible = false;
    }

    private calculatePosition() {
        let targetRect: ClientRect = (this.target).getBoundingClientRect();
        this.popoverElement.style.display = "inline-block";
        let popoverRect: ClientRect = (this.popoverElement).getBoundingClientRect();

        switch (this.placement) {
            case "right":
                this.popoverElement.style.left = (targetRect.width).toString() + "px";
                this.popoverElement.style.top = (targetRect.height / 2 - popoverRect.height / 2).toString() + "px";
                break;
            case "bottom":
                this.popoverElement.style.left = (targetRect.width / 2 - (popoverRect.width / 2)).toString() + "px";
                this.popoverElement.style.top = (targetRect.height).toString() + "px";
                break;
            case "top":
                this.popoverElement.style.left = (targetRect.width / 2 - (popoverRect.width / 2)).toString() + "px";
                this.popoverElement.style.top = (0 - popoverRect.height).toString() + "px";
                break;
            case "left":
                this.popoverElement.style.left = (0 - popoverRect.width).toString() + "px";
                this.popoverElement.style.top = ((targetRect.height / 2) - (popoverRect.height / 2)).toString() + "px";
                break;
            default:
                //this ist hier never?!?
                //this.popoverElement.style.left = (targetRect.width / 2 - (popoverRect.width / 2)).toString() + "px";
                //this.popoverElement.style.top = (0 - popoverRect.height).toString() + "px";
                break;
        }
    }
}

export class PopoverPosition {
    constructor(offsetTop: number, offsetLeft: number) {
        this.OffsetTop = offsetTop;
        this.OffsetLeft = offsetLeft;
    }
    OffsetTop: number = 0;
    OffsetLeft: number = 0;
}
