import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
    selector: 'backdrop',
    moduleId: module.id,
    template: `
        <div style="position: fixed;width: 100%;height: 100%;overflow-y: scroll;left: 0;right: 0;top: 0;bottom: 0;z-index: 2001;" class="backdrop-bg">
            <div style="position: absolute;width: 100%;height: 100%;">
                <ng-content></ng-content>
            </div>
        </div>`
})

export class BackdropComponent implements OnInit, OnDestroy {

    ngOnInit() {
        document.body.classList.add("no-scrollbar"); /* prevents double scroll bars*/
    }

    ngOnDestroy() {
        document.body.classList.remove("no-scrollbar");
    }
}