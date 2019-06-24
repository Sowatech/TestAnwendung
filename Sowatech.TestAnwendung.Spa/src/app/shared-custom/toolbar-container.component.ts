import { Component } from '@angular/core';

@Component({
    selector: 'toolbar-container',
    template: `<div class="panel m-t-sm">
                    <div class="pull-right">
                        <ng-content></ng-content>
                    </div>
                </div>
                <div style="clear:both"></div>
            `
})

export class ToolBarContainerComponent {

}