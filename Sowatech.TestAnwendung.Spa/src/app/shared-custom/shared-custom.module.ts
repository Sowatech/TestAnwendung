/// <reference path="toolbar-container.component.ts" />
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolBarContainerComponent } from "./toolbar-container.component";

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [ToolBarContainerComponent],
    exports: [ToolBarContainerComponent]
})

export class SharedCustomModule {

}