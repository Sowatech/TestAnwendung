import { Component,Input } from '@angular/core';

@Component({
    selector: 'ibox',
    templateUrl: './swt-ibox.component.html'
})

export class IBoxComponent {
    
    @Input() heading: string;
    @Input() collapsable: boolean = true;
    @Input() collapsed: boolean = false;
    @Input() headingHidden: boolean = false;
    @Input() label: string;
    
    public toggleCollapse(event:any) {
        event.preventDefault();
        if (this.collapsable) {
            this.collapsed = !this.collapsed;
        }
    }
}
