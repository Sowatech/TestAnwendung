import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DragulaDirective } from './swt-dragula.directive';
import { DragulaService } from './swt-dragula.service';

//-------------------------
export { DragulaService, IDropEvent, IDragulaBagOptions, IRemoveEvent } from './swt-dragula.service';


@NgModule({
    imports: [CommonModule],
    declarations: [DragulaDirective],
    exports: [DragulaDirective],
    providers: [DragulaService]
})
export class DragulaModule { }