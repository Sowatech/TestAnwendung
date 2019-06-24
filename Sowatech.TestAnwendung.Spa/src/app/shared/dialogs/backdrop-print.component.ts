import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'backdrop-print',
    moduleId: module.id,
    template: `
        <div class="print-backdrop backdrop-bg">
            <div class="print-content-wrapper">
              <div class="print-content">
                    <ng-content></ng-content>
              </div>
            </div>
        </div>`,
    styles: [
        ` 
@media print {
    .print-backdrop {
        overflow-y: initial;
        position: initial;
        /*width: 100%;*/
        height: initial;
    }

    .print-content{
        position: initial;
        /*height: initial;*/
    }
}

@media screen {
    .print-backdrop {
        overflow-y: scroll;
        position: fixed;
        width: 100%;
        min-height: 100%;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 9001;
        background-color: silver !important;
    }

    .print-content-wrapper{
        display: flex;
        justify-content: center;
     }

    .print-content{
        position: absolute;
        width: 21cm;
        padding: 0 1.5cm;
        min-height: 100%;
        background-color: white;
    }
}
`]
})

export class BackdropPrintComponent implements OnInit, OnDestroy {

    ngOnInit() {
        document.body.classList.add("no-scrollbar"); /* prevents double scroll bars*/
    }

    ngOnDestroy() {
        document.body.classList.remove("no-scrollbar");
    }
}
