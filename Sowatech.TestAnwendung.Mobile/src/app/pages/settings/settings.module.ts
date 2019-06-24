import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SettingsPage } from './settings.page';
import { SettingsApiService } from "./settings.service";

@NgModule({
    declarations: [SettingsPage],
    imports: [IonicModule],
    entryComponents: [SettingsPage],
    providers: [SettingsApiService]
})
export class SettingsPageModule { }