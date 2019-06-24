import { NgModule } from '@angular/core';

import { IonicModule } from 'ionic-angular';

import { LoginPage } from './login.page';
import { SharedModule } from '../../shared';
import { WebApiModule } from '../../web-api/web-api.module';

@NgModule({
    declarations: [LoginPage],
    imports: [
        SharedModule,
        IonicModule,
        WebApiModule
    ],
    entryComponents: [LoginPage]
})
export class LoginPageModule { }