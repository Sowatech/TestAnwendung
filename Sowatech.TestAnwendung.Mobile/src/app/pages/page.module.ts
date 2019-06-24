import { NgModule } from '@angular/core';

import { HomePageModule } from './home/home.module';
import { LoginPageModule } from './login/login.module';
import { SettingsPageModule } from './settings/settings.module';

@NgModule({
    declarations: [],
    imports: [LoginPageModule, HomePageModule, SettingsPageModule],
    exports: []
})
export class PageModule { }