import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserSupportService } from './browser-support.service';
import { BrowserSupportInfoComponent } from './browser-support-info.component';
import { VisibleForBrowserDirective } from './visible-for-browser.directive';
import { HiddenForBrowserDirective } from './hidden-for-browser.directive';

@NgModule({
    imports: [CommonModule],
    declarations: [BrowserSupportInfoComponent, VisibleForBrowserDirective, HiddenForBrowserDirective],
    exports: [BrowserSupportInfoComponent, VisibleForBrowserDirective, HiddenForBrowserDirective],
    providers: [BrowserSupportService]
})
export class BrowserSupportModule { }