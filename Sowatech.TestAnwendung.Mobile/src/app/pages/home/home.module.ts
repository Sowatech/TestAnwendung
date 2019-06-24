import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { HomePage } from './home.page';
import { SharedModule } from '../../shared';

@NgModule({
    declarations: [HomePage],
    imports: [
        SharedModule, IonicModule
    ],
    exports: [],
    entryComponents: [HomePage]
})
export class HomePageModule { }